import React, { useState } from "react";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { formatCurrency } from "../../Utils/paymentHelper";
import { getExpenses, saveExpenses, todayISO } from "../../Utils/pgRequirementStore";

const expenseCategories = ["Electricity", "Water", "Internet", "Staff Salary", "Maintenance", "Cleaning", "Repairs", "Marketing", "Food", "Other"];
const paymentModes = ["UPI", "Cash", "QR", "Bank Transfer", "Gateway"];
const expenseStatuses = ["Unpaid", "Approved", "Paid", "Partially Paid", "Rejected", "Reimbursed"];
const emptyExpense = { category: "Electricity", amount: "", vendor: "", date: todayISO(), paymentMode: "UPI", status: "Unpaid", recurring: "No", notes: "" };

const AccountingManagement = () => {
    const [expenses, setExpenses] = useState(getExpenses());
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyExpense);
    const [editingId, setEditingId] = useState("");
    const [viewExpense, setViewExpense] = useState(null);
    const [filters, setFilters] = useState({ query: "", category: "All", status: "All", month: "", year: "", sortKey: "date" });
    const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const paidTotal = expenses.filter((item) => ["Paid", "Reimbursed"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingTotal = expenses.filter((item) => ["Unpaid", "Approved", "Partially Paid"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const filteredExpenses = expenses
        .filter((expense) => filters.category === "All" || expense.category === filters.category)
        .filter((expense) => filters.status === "All" || expense.status === filters.status)
        .filter((expense) => !filters.month || String(expense.date || "").slice(5, 7) === filters.month)
        .filter((expense) => !filters.year || String(expense.date || "").slice(0, 4) === filters.year)
        .filter((expense) => `${expense.date} ${expense.category} ${expense.vendor} ${expense.paymentMode} ${expense.status} ${expense.notes} ${expense.amount}`.toLowerCase().includes(filters.query.toLowerCase()))
        .sort((a, b) => String(a[filters.sortKey] || "").localeCompare(String(b[filters.sortKey] || ""), undefined, { numeric: true }));

    const persist = (items) => {
        setExpenses(items);
        saveExpenses(items);
    };

    const addExpense = (event) => {
        event.preventDefault();
        const payload = { ...form, amount: Number(form.amount || 0), updatedAt: todayISO() };
        persist(editingId ? expenses.map((item) => item.id === editingId ? { ...item, ...payload } : item) : [{ ...payload, id: Date.now() }, ...expenses]);
        setForm(emptyExpense);
        setEditingId("");
        setShowModal(false);
    };

    const removeExpense = (id) => persist(expenses.filter((item) => item.id !== id));
    const updateExpenseStatus = (id, status) => persist(expenses.map((item) => item.id === id ? { ...item, status, updatedAt: todayISO() } : item));
    const editExpense = (expense) => {
        setEditingId(expense.id);
        setForm({ ...emptyExpense, ...expense });
        setShowModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-red-600">Expenses</h1>
                        <p className="text-sm text-slate-500">Total: <span className="font-black text-red-600">{formatCurrency(total)}</span> - Paid: <span className="font-black text-emerald-600">{formatCurrency(paidTotal)}</span> - Pending: <span className="font-black text-orange-600">{formatCurrency(pendingTotal)}</span></p>
                    </div>
                    <button className="pg-button-danger" type="button" onClick={() => setShowModal(true)}><Plus size={18} /> Add Expense</button>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow">
                    <div className="grid gap-3 border-b p-4 md:grid-cols-6">
                        <input className="pg-input" placeholder="Search expenses..." value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} />
                        <select className="pg-input" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
                            <option>All</option>
                            {expenseCategories.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <select className="pg-input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                            <option>All</option>
                            {expenseStatuses.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <input className="pg-input" placeholder="Month MM" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value.padStart(2, "0").slice(-2) })} />
                        <input className="pg-input" placeholder="Year YYYY" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })} />
                        <select className="pg-input" value={filters.sortKey} onChange={(event) => setFilters({ ...filters, sortKey: event.target.value })}>
                            <option value="date">Sort by date</option>
                            <option value="category">Sort by category</option>
                            <option value="vendor">Sort by vendor</option>
                            <option value="amount">Sort by amount</option>
                        </select>
                    </div>
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Category</th><th className="p-3">Vendor</th><th className="p-3">Mode</th><th className="p-3">Status</th><th className="p-3">Amount</th><th className="p-3"></th></tr></thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr className="border-t" key={expense.id}>
                                    <td className="p-3">{expense.date}</td>
                                    <td className="p-3"><span className="rounded-md border px-2 py-1 text-xs font-bold">{expense.category}</span></td>
                                    <td className="p-3">{expense.vendor || "-"}</td>
                                    <td className="p-3">{expense.paymentMode}</td>
                                    <td className="p-3"><select className="rounded border p-2" value={expense.status || "Unpaid"} onChange={(event) => updateExpenseStatus(expense.id, event.target.value)}>{expenseStatuses.map((item) => <option key={item}>{item}</option>)}</select></td>
                                    <td className="p-3 font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                                    <td className="p-3"><div className="flex gap-2"><button className="text-slate-600" type="button" onClick={() => setViewExpense(expense)} title="View"><Eye size={16} /></button><button className="text-violet-600" type="button" onClick={() => editExpense(expense)} title="Edit"><Pencil size={16} /></button><button className="text-red-500" type="button" onClick={() => removeExpense(expense.id)} title="Delete"><Trash2 size={16} /></button></div></td>
                                </tr>
                            ))}
                            {!filteredExpenses.length && <tr><td className="p-8 text-center text-slate-400" colSpan="7">No expenses matched.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
                        <form className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onSubmit={addExpense}>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-black">{editingId ? "Edit Expense" : "Add Expense"}</h2>
                                <button type="button" onClick={() => setShowModal(false)}><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold">
                                    Category
                                    <div className="mt-1 grid gap-2 sm:grid-cols-[1fr_1fr]">
                                        <select className="pg-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{expenseCategories.map((item) => <option key={item}>{item}</option>)}</select>
                                        <input className="pg-input" placeholder="Or type category" onChange={(event) => event.target.value && setForm({ ...form, category: event.target.value })} />
                                    </div>
                                </label>
                                <label className="block text-sm font-semibold">Amount (Rs)<input className="pg-input mt-1" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
                                <label className="block text-sm font-semibold">Vendor<input className="pg-input mt-1" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} /></label>
                                <label className="block text-sm font-semibold">Mode<select className="pg-input mt-1" value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>{paymentModes.map((item) => <option key={item}>{item}</option>)}</select></label>
                                <label className="block text-sm font-semibold">Status<select className="pg-input mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{expenseStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
                                <label className="block text-sm font-semibold">Recurring<select className="pg-input mt-1" value={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.value })}><option>No</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select></label>
                                <label className="block text-sm font-semibold">Notes<textarea className="pg-input mt-1" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
                            </div>
                            <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white" type="submit">Save</button>
                        </form>
                    </div>
                )}
                {viewExpense && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Expense Details</h2><button type="button" onClick={() => setViewExpense(null)}><X size={20} /></button></div>
                            {Object.entries(viewExpense).map(([key, value]) => <p className="mb-2 text-sm" key={key}><strong>{key}:</strong> {String(value || "-")}</p>)}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AccountingManagement;
