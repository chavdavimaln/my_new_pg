import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getStoredAllocations, getStoredRooms, getStoredStudents } from "../../Utils/allocationHelper";
import { formatCurrency, getStoredPayments } from "../../Utils/paymentHelper";
import { getExpenses, getFinancialSummary, getInquiries, getTickets, getTransferHistory } from "../../Utils/pgRequirementStore";

const Reports = () => {
    const [period, setPeriod] = useState({ mode: "all", from: "", to: "", month: "", year: "", time: "" });
    const rooms = getStoredRooms();
    const students = getStoredStudents();
    const allocations = getStoredAllocations();
    const payments = getStoredPayments();
    const expenses = getExpenses();
    const inquiries = getInquiries();
    const tickets = getTickets();
    const transfers = getTransferHistory();
    const summary = getFinancialSummary();
    const totalBeds = rooms.reduce((sum, room) => sum + (room.beds?.length || Number(room.bedCount || 0)), 0);
    const occupied = allocations.filter((item) => item.bedId).length;

    const downloadFile = (name, content, type, extension) => {
        const url = URL.createObjectURL(new Blob([content], { type }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcel = (name, rows) => {
        const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
        downloadFile(name, csv, "text/csv;charset=utf-8", "csv");
    };

    const escapePdfText = (value) => String(value ?? "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

    const buildSimplePdf = (title, rows) => {
        const lines = [title, "", ...rows.map((row) => row.join(" | "))].slice(0, 42);
        const contentLines = ["BT", "/F1 12 Tf", "50 790 Td"];
        lines.forEach((line, index) => {
            if (index > 0) contentLines.push("0 -18 Td");
            contentLines.push(`(${escapePdfText(line).slice(0, 95)}) Tj`);
        });
        contentLines.push("ET");
        const stream = contentLines.join("\n");
        const objects = [
            "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
            "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
            `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
        ];
        let pdf = "%PDF-1.4\n";
        const offsets = [0];
        objects.forEach((object) => {
            offsets.push(pdf.length);
            pdf += object;
        });
        const xrefStart = pdf.length;
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach((offset) => {
            pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
        return pdf;
    };

    const downloadPdf = (name, rows) => {
        downloadFile(name, buildSimplePdf(name, rows), "application/pdf", "pdf");
    };

    const periodLabel = [period.mode, period.from, period.to, period.month, period.year, period.time].filter(Boolean).join("-");

    const inSelectedPeriod = (dateValue) => {
        if (period.mode === "all") return true;
        const value = String(dateValue || "");
        if (!value) return false;
        if (period.from && value < period.from) return false;
        if (period.to && value > period.to) return false;
        if (period.month && value.slice(5, 7) !== period.month) return false;
        if (period.year && value.slice(0, 4) !== period.year) return false;
        if (period.time && !value.includes(period.time)) return false;
        return true;
    };

    const reportFileName = (name) => `${name.toLowerCase().replaceAll(" ", "-")}${periodLabel ? `-${periodLabel}` : ""}`;

    const reports = [
        { name: "Income Report", amount: formatCurrency(summary.income), tone: "border-emerald-500", rows: [["Student", "Type", "Amount", "Method", "Date"], ...payments.filter((item) => inSelectedPeriod(item.date || item.paidAt)).map((item) => [item.studentName, item.type || "Rent", item.amount || item.total, item.method || item.paymentMethod, item.date || item.paidAt])] },
        { name: "Expense Report", amount: formatCurrency(summary.expenses), tone: "border-red-500", rows: [["Category", "Vendor", "Amount", "Date"], ...expenses.filter((item) => inSelectedPeriod(item.date)).map((item) => [item.category, item.vendor, item.amount, item.date])] },
        { name: "Profit Report", amount: formatCurrency(summary.profit), tone: "border-violet-500", rows: [["Income", "Expenses", "Profit"], [summary.income, summary.expenses, summary.profit]] },
        { name: "Student Report", amount: `${students.length} students`, tone: "border-fuchsia-500", rows: [["Name", "Phone", "Status", "Joining Date"], ...students.filter((item) => inSelectedPeriod(item.joiningDate)).map((item) => [item.name, item.phone, item.status, item.joiningDate])] },
        { name: "Occupancy Report", amount: `${occupied}/${totalBeds} occupied`, tone: "border-blue-500", rows: [["Student", "Room", "Bed"], ...allocations.map((item) => [item.studentName, item.roomNumber, item.bedLabel || item.bedId])] },
        { name: "Inquiry Report", amount: `${inquiries.length} leads`, tone: "border-cyan-500", rows: [["Name", "Phone", "Status", "Follow Up"], ...inquiries.filter((item) => inSelectedPeriod(item.followUp || item.createdAt)).map((item) => [item.name, item.phone, item.status, item.followUp || item.createdAt])] },
        { name: "Ticket Report", amount: `${tickets.length} tickets`, tone: "border-orange-500", rows: [["Title", "Raised By", "Status", "Date"], ...tickets.filter((item) => inSelectedPeriod(item.date)).map((item) => [item.title, item.raisedBy, item.status, item.date])] },
        { name: "Transfer Report", amount: `${transfers.length} transfers`, tone: "border-slate-500", rows: [["Date", "Student", "From", "To"], ...transfers.filter((item) => inSelectedPeriod(item.date)).map((item) => [item.date, item.studentName, item.fromRoom, item.toRoom])] },
    ];

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-black text-violet-700">Reports</h1>
                    <p className="text-sm text-slate-500">Download in Excel or PDF</p>
                </div>
                <div className="grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-3 xl:grid-cols-6">
                    <select className="pg-input" value={period.mode} onChange={(event) => setPeriod({ ...period, mode: event.target.value })}>
                        <option value="all">All time</option>
                        <option value="date">Date wise</option>
                        <option value="month">Month wise</option>
                        <option value="year">Year wise</option>
                        <option value="time">Time wise</option>
                    </select>
                    <input className="pg-input" type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />
                    <input className="pg-input" type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />
                    <input className="pg-input" placeholder="Month MM" value={period.month} onChange={(event) => setPeriod({ ...period, month: event.target.value.padStart(2, "0").slice(-2) })} />
                    <input className="pg-input" placeholder="Year YYYY" value={period.year} onChange={(event) => setPeriod({ ...period, year: event.target.value })} />
                    <input className="pg-input" type="time" value={period.time} onChange={(event) => setPeriod({ ...period, time: event.target.value })} />
                </div>
                <div className="rounded-xl bg-white p-5 shadow">
                    <h2 className="mb-5 font-black">Occupancy Snapshot</h2>
                    <div className="grid gap-4 md:grid-cols-5">
                        {[["Total Beds", totalBeds], ["Occupied", occupied], ["Available", Math.max(totalBeds - occupied, 0)], ["Pending", payments.filter((item) => item.status === "Pending").length], ["Occupancy %", `${totalBeds ? Math.round((occupied / totalBeds) * 100) : 0}%`]].map(([label, value]) => <div key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>)}
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {reports.map((report) => (
                        <div className={`rounded-xl border-t-4 ${report.tone} bg-white p-5 shadow`} key={report.name}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-black">{report.name}</h3>
                                    <p className="text-sm text-slate-500">{report.rows.length - 1} records</p>
                                </div>
                                <p className="font-black text-violet-600">{report.amount}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadExcel(reportFileName(report.name), report.rows)}><Download size={16} className="inline" /> Excel</button>
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadPdf(reportFileName(report.name), report.rows)}><FileText size={16} className="inline" /> PDF</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Reports;
