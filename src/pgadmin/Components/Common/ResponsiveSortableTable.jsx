import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const getValue = (row, column) => {
    if (column.sortValue) return column.sortValue(row);
    if (column.accessor) return row[column.accessor];
    return "";
};

const normalize = (value) => String(value ?? "").toLowerCase();

const ResponsiveSortableTable = ({
    columns,
    rows,
    rowKey,
    searchPlaceholder = "Search...",
    searchable = true,
    pageSize = 10,
    maxHeight = "28rem",
    emptyMessage = "No records found",
}) => {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ key: columns[0]?.key, direction: "asc" });
    const [page, setPage] = useState(1);

    const filteredRows = useMemo(() => {
        const searchText = normalize(search);
        const visibleRows = searchText
            ? rows.filter((row) =>
                  columns.some((column) => {
                      if (column.searchable === false) return false;
                      return normalize(getValue(row, column)).includes(searchText);
                  }),
              )
            : rows;

        const sortColumn = columns.find((column) => column.key === sort.key);
        if (!sortColumn || sortColumn.sortable === false) return visibleRows;

        return [...visibleRows].sort((a, b) => {
            const first = getValue(a, sortColumn);
            const second = getValue(b, sortColumn);
            const comparison = normalize(first).localeCompare(normalize(second), undefined, {
                numeric: true,
                sensitivity: "base",
            });
            return sort.direction === "asc" ? comparison : -comparison;
        });
    }, [columns, rows, search, sort]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pagedRows = filteredRows.slice(startIndex, startIndex + pageSize);

    const changeSort = (column) => {
        if (column.sortable === false) return;
        setPage(1);
        setSort((current) => ({
            key: column.key,
            direction: current.key === column.key && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    return (
        // Table program: pass columns/rows from each page; this component owns search, sort, and paging UI.
        <div className="space-y-3">
            {searchable && (
                <div className="relative max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder={searchPlaceholder}
                        className="pg-input pl-9"
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <div className="overflow-y-auto" style={{ maxHeight }}>
                    <table className="min-w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr>
                                {columns.map((column) => {
                                    const isSorted = sort.key === column.key;
                                    return (
                                        <th key={column.key} className="border-b border-slate-200 p-3 font-bold text-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => changeSort(column)}
                                                className={`flex w-full items-center gap-1 text-left ${
                                                    column.sortable === false ? "cursor-default" : "cursor-pointer"
                                                }`}
                                                disabled={column.sortable === false}
                                                title={column.sortable === false ? undefined : `Sort by ${column.header}`}
                                            >
                                                <span>{column.header}</span>
                                                {column.sortable !== false && isSorted && (
                                                    sort.direction === "asc" ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )
                                                )}
                                            </button>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {pagedRows.length > 0 ? (
                                pagedRows.map((row, index) => (
                                    <tr key={rowKey(row, startIndex + index)} className="odd:bg-white even:bg-slate-50/70">
                                        {columns.map((column) => (
                                            <td key={column.key} className="border-b border-slate-100 p-3 align-top">
                                                {column.render ? column.render(row) : getValue(row, column)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="p-4 text-center text-slate-500" colSpan={columns.length}>
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                    Showing {filteredRows.length ? startIndex + 1 : 0}-
                    {Math.min(startIndex + pageSize, filteredRows.length)} of {filteredRows.length}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveSortableTable;
