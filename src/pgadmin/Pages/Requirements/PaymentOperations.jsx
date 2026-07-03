import React, { useMemo, useState } from "react";
import { FileText, Mail, MessageCircle, Plus } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { formatCurrency, getStoredPayments, saveStoredPayments } from "../../Utils/paymentHelper";
import { logSendAction, todayISO } from "../../Utils/pgRequirementStore";
import { showInfoPopup, showSuccessPopup } from "../../../utils/popup";

const tabs = ["All", "Rent", "Partial", "Deposit", "Late Fee", "Extra"];
const methods = ["UPI", "Cash", "QR", "Razorpay", "Gateway", "Bank Transfer"];

const PaymentOperations = () => {
    const [payments, setPayments] = useState(getStoredPayments());
    const [active, setActive] = useState("All");
    const [query, setQuery] = useState("");
    const [method, setMethod] = useState("All");
    const [dateFilters, setDateFilters] = useState({ month: "", year: "", sortKey: "date" });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ studentName: "", receiptNo: "", type: "Rent", amount: "", pending: "", method: "UPI", date: todayISO(), status: "Paid" });

    const summary = useMemo(() => ({
        collected: payments.filter((item) => item.status === "Paid").reduce((total, item) => total + Number(item.amount || item.total || 0), 0),
        pending: payments.reduce((total, item) => total + Number(item.pending || 0), 0),
    }), [payments]);

    const filtered = payments
        .filter((item) => active === "All" || String(item.type || item.paymentType || "").toLowerCase() === active.toLowerCase())
        .filter((item) => method === "All" || (item.method || item.paymentMethod) === method)
        .filter((item) => !dateFilters.month || String(item.date || item.paidAt || "").slice(5, 7) === dateFilters.month)
        .filter((item) => !dateFilters.year || String(item.date || item.paidAt || "").slice(0, 4) === dateFilters.year)
        .filter((item) => `${item.studentName} ${item.receiptNo} ${item.receiptId} ${item.type} ${item.paymentType} ${item.method} ${item.paymentMethod} ${item.date}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => String(a[dateFilters.sortKey] || a.paidAt || "").localeCompare(String(b[dateFilters.sortKey] || b.paidAt || ""), undefined, { numeric: true }));

    const notifyPayment = (payment, channel) => {
        const target = channel === "email" ? payment.email || payment.studentName || "student" : payment.phone || payment.studentName || "student";
        logSendAction({ type: channel, module: "income", target, studentName: payment.studentName || "Student" });
        showSuccessPopup(
            "Reminder Queued",
            `${channel === "email" ? "Email" : "WhatsApp"} reminder queued for ${payment.studentName || "student"}.`,
        );
    };

    const showPaymentReport = (payment) => {
        showInfoPopup("Payment Report", [
            `Receipt: ${payment.receiptNo || payment.receiptId || "-"}`,
            `Student: ${payment.studentName || "-"}`,
            `Type: ${payment.type || payment.paymentType || "Rent"}`,
            `Amount: ${formatCurrency(payment.amount || payment.total || 0)}`,
            `Pending: ${formatCurrency(payment.pending || 0)}`,
        ].join("\n"));
    };

    const savePayment = (event) => {
        event.preventDefault();
        const payment = {
            ...form,
            id: Date.now(),
            amount: Number(form.amount || 0),
            total: Number(form.amount || 0),
            pending: Number(form.pending || 0),
            receiptNo: form.receiptNo || `JA-${Date.now()}`,
            paymentMethod: form.method,
        };
        const next = [payment, ...payments];
        setPayments(next);
        saveStoredPayments(next);
        setForm({ studentName: "", receiptNo: "", type: "Rent", amount: "", pending: "", method: "UPI", date: todayISO(), status: "Paid" });
        setShowForm(false);
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-emerald-700">Income / Payments</h1>
                        <p className="text-sm text-slate-500">Collected: <span className="font-black text-emerald-600">{formatCurrency(summary.collected)}</span> - Pending from partials: <span className="font-black text-orange-600">{formatCurrency(summary.pending)}</span></p>
                    </div>
                    <button className="pg-button-success" type="button" onClick={() => setShowForm(true)}><Plus size={18} /> Record Payment</button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${active === tab ? "bg-emerald-600 text-white" : "border bg-white"}`} key={tab} onClick={() => setActive(tab)}>{tab}</button>)}
                    <input className="pg-input max-w-xs" placeholder="Search payments..." value={query} onChange={(event) => setQuery(event.target.value)} />
                    <select className="pg-input max-w-xs" value={method} onChange={(event) => setMethod(event.target.value)}>
                        <option>All</option>
                        {methods.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <input className="pg-input max-w-[8rem]" placeholder="Month" value={dateFilters.month} onChange={(event) => setDateFilters({ ...dateFilters, month: event.target.value.padStart(2, "0").slice(-2) })} />
                    <input className="pg-input max-w-[8rem]" placeholder="Year" value={dateFilters.year} onChange={(event) => setDateFilters({ ...dateFilters, year: event.target.value })} />
                    <select className="pg-input max-w-xs" value={dateFilters.sortKey} onChange={(event) => setDateFilters({ ...dateFilters, sortKey: event.target.value })}>
                        <option value="date">Sort by date</option>
                        <option value="studentName">Sort by student</option>
                        <option value="type">Sort by type</option>
                        <option value="amount">Sort by amount</option>
                        <option value="pending">Sort by pending</option>
                    </select>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow">
                    <table className="w-full min-w-[980px] text-left text-sm">
                        <thead className="text-slate-500"><tr><th className="p-3">Receipt</th><th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Type</th><th className="p-3">Method</th><th className="p-3">Amount</th><th className="p-3">Pending</th><th className="p-3">Actions</th></tr></thead>
                        <tbody>
                            {filtered.map((payment) => (
                                <tr className="border-t" key={payment.id}>
                                    <td className="p-3">{payment.receiptNo || payment.receiptId}</td>
                                    <td className="p-3">{payment.date || payment.paidAt || "-"}</td>
                                    <td className="p-3 font-bold">{payment.studentName || "-"}</td>
                                    <td className="p-3">{payment.type || payment.paymentType || "Rent"}</td>
                                    <td className="p-3">{payment.method || payment.paymentMethod}</td>
                                    <td className="p-3 font-bold text-emerald-700">{formatCurrency(payment.amount || payment.total || 0)}</td>
                                    <td className="p-3 text-orange-600">{formatCurrency(payment.pending || 0)}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button className="rounded border p-2 text-emerald-700" type="button" onClick={() => notifyPayment(payment, "whatsapp")} title="Send WhatsApp reminder"><MessageCircle size={15} /></button>
                                            <button className="rounded border p-2 text-blue-700" type="button" onClick={() => notifyPayment(payment, "email")} title="Send email reminder"><Mail size={15} /></button>
                                            <button className="rounded border p-2 text-violet-700" type="button" onClick={() => showPaymentReport(payment)} title="View payment report"><FileText size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && <tr><td className="p-8 text-center text-slate-400" colSpan="8">No payments in this view.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                        <form className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" onSubmit={savePayment}>
                            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Record Payment</h2><button type="button" onClick={() => setShowForm(false)}>x</button></div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <input className="pg-input" placeholder="Receipt" value={form.receiptNo} onChange={(event) => setForm({ ...form, receiptNo: event.target.value })} />
                                <input className="pg-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                                <input className="pg-input" placeholder="Student" value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} />
                                <select className="pg-input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{tabs.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select>
                                <select className="pg-input" value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>{methods.map((item) => <option key={item}>{item}</option>)}</select>
                                <input className="pg-input" type="number" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
                                <input className="pg-input" type="number" placeholder="Pending" value={form.pending} onChange={(event) => setForm({ ...form, pending: event.target.value })} />
                            </div>
                            <button className="pg-button-success mt-4 w-full" type="submit">Save Payment</button>
                        </form>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default PaymentOperations;
