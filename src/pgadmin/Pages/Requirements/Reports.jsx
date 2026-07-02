import React, { useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getStoredAllocations, getStoredRooms, getStoredStudents } from "../../Utils/allocationHelper";
import { formatCurrency, getStoredPayments, toAmount } from "../../Utils/paymentHelper";
import { getExpenses, getInquiries, getTickets, getTransferHistory, todayISO } from "../../Utils/pgRequirementStore";

const Reports = () => {
    const [period, setPeriod] = useState({ mode: "all", day: "", from: "", to: "", month: "", year: "", time: "" });
    const [selectedReportName, setSelectedReportName] = useState("");
    const rooms = getStoredRooms();
    const students = getStoredStudents();
    const allocations = getStoredAllocations();
    const payments = getStoredPayments();
    const expenses = getExpenses();
    const inquiries = getInquiries();
    const tickets = getTickets();
    const transfers = getTransferHistory();
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

    const normalizeDate = (value) => String(value || "").slice(0, 10);
    const normalizeTime = (value) => {
        const text = String(value || "");
        const match = text.match(/(?:T|\s)(\d{2}:\d{2})/);
        return match?.[1] || "";
    };

    const getPaymentDate = (item) => item.date || item.paidAt || item.createdAt || item.dueDate;
    const getTicketDate = (item) => item.createdDate || item.date || item.createdAt;
    const getAllocationDate = (item) => item.date || item.allocatedAt || item.createdAt || item.joiningDate;

    const scopeText = (() => {
        if (period.mode === "day") return period.day ? `Day: ${period.day}` : "Day wise";
        if (period.mode === "date") {
            if (period.from && period.to) return `Date: ${period.from} to ${period.to}`;
            if (period.from) return `Date from ${period.from}`;
            if (period.to) return `Date up to ${period.to}`;
            return "Date range";
        }
        if (period.mode === "month") return period.month ? `Month: ${period.month}` : "Month wise";
        if (period.mode === "year") return period.year ? `Year: ${period.year}` : "Year wise";
        if (period.mode === "time") return period.time ? `Time: ${period.time}` : "Time wise";
        return "All time";
    })();

    const periodLabel = scopeText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const inSelectedPeriod = (dateValue) => {
        const value = normalizeDate(dateValue);
        const time = normalizeTime(dateValue);

        if (period.mode === "all") return true;
        if (!value) return false;
        if (period.mode === "day" && period.day && value !== period.day) return false;
        if (period.mode === "date") {
            if (period.from && value < period.from) return false;
            if (period.to && value > period.to) return false;
        }
        if (period.mode === "month" && period.month && value.slice(0, 7) !== period.month) return false;
        if (period.mode === "year" && period.year && value.slice(0, 4) !== period.year) return false;
        if (period.mode === "time") {
            if (!period.time) return true;
            if (!time || time !== period.time) return false;
        }
        return true;
    };

    const filteredPayments = payments.filter((item) => inSelectedPeriod(getPaymentDate(item)));
    const filteredExpenses = expenses.filter((item) => inSelectedPeriod(item.date));
    const filteredStudents = students.filter((item) => inSelectedPeriod(item.joiningDate || item.admissionDate || item.createdAt));
    const filteredAllocations = allocations.filter((item) => inSelectedPeriod(getAllocationDate(item)));
    const filteredInquiries = inquiries.filter((item) => inSelectedPeriod(item.followUp || item.date || item.createdAt));
    const filteredTickets = tickets.filter((item) => inSelectedPeriod(getTicketDate(item)));
    const filteredTransfers = transfers.filter((item) => inSelectedPeriod(item.date || item.createdAt));
    const filteredIncome = filteredPayments.reduce((total, item) => total + toAmount(item.amount || item.total), 0);
    const filteredExpenseTotal = filteredExpenses.reduce((total, item) => total + toAmount(item.amount), 0);
    const filteredProfit = filteredIncome - filteredExpenseTotal;

    const reportFileName = (name) => `${name.toLowerCase().replaceAll(" ", "-")}${periodLabel ? `-${periodLabel}` : ""}`;
    const withReportHeader = (name, rows) => [
        [name],
        ["Scope", scopeText],
        ["Generated", todayISO()],
        [],
        ...rows,
    ];

    const reports = [
        { name: "Income Report", amount: formatCurrency(filteredIncome), tone: "border-emerald-500", rows: [["Student", "Type", "Amount", "Method", "Date"], ...filteredPayments.map((item) => [item.studentName, item.type || "Rent", item.amount || item.total, item.method || item.paymentMethod, normalizeDate(getPaymentDate(item))])] },
        { name: "Expense Report", amount: formatCurrency(filteredExpenseTotal), tone: "border-red-500", rows: [["Category", "Vendor", "Amount", "Date"], ...filteredExpenses.map((item) => [item.category, item.vendor, item.amount, normalizeDate(item.date)])] },
        { name: "Profit Report", amount: formatCurrency(filteredProfit), tone: "border-violet-500", rows: [["Income", "Expenses", "Profit"], [filteredIncome, filteredExpenseTotal, filteredProfit]] },
        { name: "Student Report", amount: `${filteredStudents.length} students`, tone: "border-fuchsia-500", rows: [["Name", "Phone", "Status", "Joining Date"], ...filteredStudents.map((item) => [item.name, item.phone, item.status, normalizeDate(item.joiningDate || item.admissionDate || item.createdAt)])] },
        { name: "Occupancy Report", amount: period.mode === "all" ? `${occupied}/${totalBeds} occupied` : `${filteredAllocations.length} allocations`, tone: "border-blue-500", rows: [["Student", "Room", "Bed", "Date"], ...filteredAllocations.map((item) => [item.studentName, item.roomNumber, item.bedLabel || item.bedId, normalizeDate(getAllocationDate(item))])] },
        { name: "Inquiry Report", amount: `${filteredInquiries.length} leads`, tone: "border-cyan-500", rows: [["Name", "Phone", "Status", "Follow Up"], ...filteredInquiries.map((item) => [item.name, item.phone, item.status, normalizeDate(item.followUp || item.date || item.createdAt)])] },
        { name: "Ticket Report", amount: `${filteredTickets.length} tickets`, tone: "border-orange-500", rows: [["Title", "Raised By", "Status", "Date"], ...filteredTickets.map((item) => [item.title, item.raisedBy || item.studentName, item.status, normalizeDate(getTicketDate(item))])] },
        { name: "Transfer Report", amount: `${filteredTransfers.length} transfers`, tone: "border-slate-500", rows: [["Date", "Student", "From", "To"], ...filteredTransfers.map((item) => [normalizeDate(item.date || item.createdAt), item.studentName, item.fromRoom, item.toRoom])] },
    ];
    const selectedReport = reports.find((report) => report.name === selectedReportName);
    const selectedHeaders = selectedReport?.rows?.[0] || [];
    const selectedRows = selectedReport?.rows?.slice(1) || [];

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
                        <option value="day">Day wise</option>
                        <option value="date">Date range</option>
                        <option value="month">Month wise</option>
                        <option value="year">Year wise</option>
                        <option value="time">Time wise</option>
                    </select>
                    {period.mode === "day" && <input className="pg-input" type="date" value={period.day} onChange={(event) => setPeriod({ ...period, day: event.target.value })} />}
                    {period.mode === "date" && <input className="pg-input" type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} />}
                    {period.mode === "date" && <input className="pg-input" type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} />}
                    {period.mode === "month" && <input className="pg-input" type="month" value={period.month} onChange={(event) => setPeriod({ ...period, month: event.target.value })} />}
                    {period.mode === "year" && <input className="pg-input" placeholder="Year YYYY" value={period.year} onChange={(event) => setPeriod({ ...period, year: event.target.value.replace(/\D/g, "").slice(0, 4) })} />}
                    {period.mode === "time" && <input className="pg-input" type="time" value={period.time} onChange={(event) => setPeriod({ ...period, time: event.target.value })} />}
                    <button className="rounded-lg border bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50" type="button" onClick={() => setPeriod({ mode: "all", day: "", from: "", to: "", month: "", year: "", time: "" })}>Clear</button>
                    <p className="text-sm font-bold text-slate-500 md:col-span-3 xl:col-span-6">{scopeText}</p>
                </div>
                <div className="rounded-xl bg-white p-5 shadow">
                    <h2 className="mb-5 font-black">Occupancy Snapshot</h2>
                    <div className="grid gap-4 md:grid-cols-5">
                        {[["Total Beds", totalBeds], ["Occupied", occupied], ["Available", Math.max(totalBeds - occupied, 0)], ["Pending", filteredPayments.filter((item) => item.status === "Pending").length], ["Occupancy %", `${totalBeds ? Math.round((occupied / totalBeds) * 100) : 0}%`]].map(([label, value]) => <div key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>)}
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
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => setSelectedReportName(report.name)}><Eye size={16} className="inline" /> View</button>
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadExcel(reportFileName(report.name), withReportHeader(report.name, report.rows))}><Download size={16} className="inline" /> Excel</button>
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadPdf(reportFileName(report.name), withReportHeader(report.name, report.rows))}><FileText size={16} className="inline" /> PDF</button>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedReport && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
                        <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl">
                            <div className="flex items-start justify-between gap-4 border-b p-4">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">{selectedReport.name}</h2>
                                    <p className="text-sm font-semibold text-slate-500">{scopeText} | {selectedRows.length} records</p>
                                </div>
                                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" onClick={() => setSelectedReportName("")} aria-label="Close report preview">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="min-h-0 flex-1 overflow-auto p-4">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            {selectedHeaders.map((header) => (
                                                <th className="border-b px-3 py-2 font-black" key={header}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRows.map((row, rowIndex) => (
                                            <tr className="border-b last:border-b-0" key={`${selectedReport.name}-${rowIndex}`}>
                                                {selectedHeaders.map((header, cellIndex) => (
                                                    <td className="px-3 py-2 text-slate-700" key={`${header}-${cellIndex}`}>{row[cellIndex] ?? "-"}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        {!selectedRows.length && (
                                            <tr>
                                                <td className="px-3 py-6 text-center text-sm font-semibold text-slate-400" colSpan={Math.max(selectedHeaders.length, 1)}>No records found for this selection.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 border-t p-4">
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadExcel(reportFileName(selectedReport.name), withReportHeader(selectedReport.name, selectedReport.rows))}><Download size={16} className="inline" /> Excel</button>
                                <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={() => downloadPdf(reportFileName(selectedReport.name), withReportHeader(selectedReport.name, selectedReport.rows))}><FileText size={16} className="inline" /> PDF</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reports;
