from pathlib import Path
import textwrap


def _escape_pdf_text(value):
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .encode("latin-1", "replace")
        .decode("latin-1")
    )


def make_pdf(source, target):
    source = Path(source)
    target = Path(target)
    lines = []

    for raw in source.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            lines.append("")
        else:
            lines.extend(textwrap.wrap(raw, width=92) or [""])

    pages = [lines[index : index + 45] for index in range(0, len(lines), 45)] or [[]]
    objects = []

    def add_object(content):
        objects.append(content)
        return len(objects)

    catalog_id = add_object("")
    pages_id = add_object("")
    font_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    page_ids = []

    for page in pages:
        stream = "BT /F1 10 Tf 42 790 Td 14 TL "
        for line in page:
            stream += f"({_escape_pdf_text(line)}) Tj T* "
        stream += "ET"
        content_id = add_object(f"<< /Length {len(stream.encode('latin-1'))} >>\nstream\n{stream}\nendstream")
        page_id = add_object(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> /Contents {content_id} 0 R >>"
        )
        page_ids.append(page_id)

    objects[catalog_id - 1] = f"<< /Type /Catalog /Pages {pages_id} 0 R >>"
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{' '.join(f'{page_id} 0 R' for page_id in page_ids)}] /Count {len(page_ids)} >>"

    data = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, content in enumerate(objects, start=1):
        offsets.append(len(data))
        data.extend(f"{index} 0 obj\n{content}\nendobj\n".encode("latin-1"))

    xref_position = len(data)
    data.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("latin-1"))
    for offset in offsets[1:]:
        data.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    data.extend(
        f"trailer << /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
        f"startxref\n{xref_position}\n%%EOF".encode("latin-1")
    )
    target.write_bytes(data)


if __name__ == "__main__":
    docs = Path("docs")
    make_pdf(docs / "LIVE_SERVER_SQL_SETUP_GUIDE.md", docs / "LIVE_SERVER_SQL_SETUP_GUIDE.pdf")
    make_pdf(docs / "API_CHANGE_GUIDE.md", docs / "API_CHANGE_GUIDE.pdf")
    print("PDF guides generated")
