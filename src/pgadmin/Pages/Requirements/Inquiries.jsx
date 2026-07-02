import React, { useMemo, useState } from "react";
import { Copy, Eye, Plus } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getInquiries, saveInquiries, todayISO } from "../../Utils/pgRequirementStore";

const statuses = ["All", "New", "Contacted", "Visited", "Negotiating", "Converting", "Converted", "Lost"];

const Inquiries = () => {
    const [items, setItems] = useState(getInquiries());
    const [activeStatus, setActiveStatus] = useState("All");
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState("date");
    const [form, setForm] = useState({ name: "", phone: "", source: "Walk-in", roomPreference: "", budget: "", followUp: todayISO(), status: "New" });
    const [showForm, setShowForm] = useState(false);
    const [viewLead, setViewLead] = useState(null);
    const publicUrl = `${window.location.origin}/enquire`;

    const stats = useMemo(() => {
        const converted = items.filter((item) => item.status === "Converted").length;
        const lost = items.filter((item) => item.status === "Lost").length;
        return {
            total: items.length,
            converted,
            lost,
            rate: items.length ? Math.round((converted / items.length) * 100) : 0,
        };
    }, [items]);

    const filtered = items
        .filter((item) => activeStatus === "All" || item.status === activeStatus)
        .filter((item) => `${item.name} ${item.phone} ${item.source}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")));

    const saveLead = (event) => {
        event.preventDefault();
        const next = [{ ...form, id: Date.now(), date: todayISO(), requirement: "PG Stay" }, ...items];
        setItems(next);
        saveInquiries(next);
        setForm({ name: "", phone: "", source: "Walk-in", roomPreference: "", budget: "", followUp: todayISO(), status: "New" });
        setShowForm(false);
    };

    const copyPublicUrl = async () => {
        await navigator.clipboard.writeText(publicUrl);
        alert("Public enquiry URL copied");
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-violet-700">Inquiries / Leads CRM</h1>
                        <p className="text-sm text-slate-500">Track prospects from first inquiry to conversion</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button">Import CSV</button>
                        <button className="pg-button-primary" type="button" onClick={() => setShowForm(true)}><Plus size={18} /> New Lead</button>
                    </div>
                </div>

                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="font-black text-slate-900">Public Enquiry Page</p>
                            <p className="text-sm text-slate-600">Share this on Instagram bio, WhatsApp, posters. Walk-ins fill it and become leads automatically.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <input className="pg-input w-64" readOnly value={publicUrl} />
                            <button className="rounded-lg border bg-white px-3 py-2 text-sm font-bold" type="button" onClick={copyPublicUrl} title="Copy public enquiry URL"><Copy size={16} /></button>
                            <a className="rounded-lg border bg-white px-3 py-2 text-sm font-bold" href={publicUrl} target="_blank" rel="noreferrer" title="View public enquiry page"><Eye size={16} /></a>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        ["Total Leads", stats.total, "from-violet-500 to-fuchsia-600"],
                        ["Converted", stats.converted, "from-emerald-500 to-teal-600"],
                        ["Conversion Rate", `${stats.rate}%`, "from-blue-500 to-indigo-600"],
                        ["Lost", stats.lost, "from-red-500 to-orange-600"],
                    ].map(([label, value, tone]) => (
                        <div className={`rounded-xl bg-gradient-to-r ${tone} p-4 text-white shadow`} key={label}>
                            <p className="text-sm">{label}</p>
                            <p className="mt-2 text-3xl font-black">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl bg-white p-4 shadow">
                    <p className="mb-3 text-sm font-bold">Pipeline</p>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeStatus === status ? "bg-slate-900 text-white" : "bg-slate-100 text-violet-700"}`}
                                onClick={() => setActiveStatus(status)}
                                type="button"
                            >
                                {status} ({status === "All" ? items.length : items.filter((item) => item.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl bg-white shadow">
                    <div className="flex flex-wrap gap-3 border-b p-4">
                        <input className="pg-input max-w-xs" placeholder="Search leads..." value={query} onChange={(event) => setQuery(event.target.value)} />
                        <select className="pg-input max-w-xs" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                            <option value="date">Sort by date</option>
                            <option value="name">Sort by name</option>
                            <option value="status">Sort by status</option>
                            <option value="budget">Sort by budget</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="text-slate-500"><tr><th className="p-3">Lead</th><th className="p-3">Source</th><th className="p-3">Room Pref</th><th className="p-3">Budget</th><th className="p-3">Follow-up</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
                            <tbody>
                                {filtered.map((item) => <tr className="border-t" key={item.id}><td className="p-3 font-bold">{item.name}<p className="font-normal text-slate-500">{item.phone}</p></td><td className="p-3">{item.source}</td><td className="p-3">{item.roomPreference || "-"}</td><td className="p-3">{item.budget || "-"}</td><td className="p-3">{item.followUp || "-"}</td><td className="p-3"><span className="pg-badge bg-violet-100 text-violet-700">{item.status}</span></td><td className="p-3"><button className="rounded border px-3 py-1 text-sm font-bold" type="button" onClick={() => setViewLead(item)}>View</button></td></tr>)}
                                {!filtered.length && <tr><td className="p-8 text-center text-slate-400" colSpan="7">No leads. Click New Lead to start tracking.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                        <form className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" onSubmit={saveLead}>
                            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">New Lead</h2><button type="button" onClick={() => setShowForm(false)}>x</button></div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {["name", "phone", "source", "roomPreference", "budget"].map((key) => <input className="pg-input" key={key} placeholder={key} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />)}
                                <input className="pg-input" type="date" value={form.followUp} onChange={(event) => setForm({ ...form, followUp: event.target.value })} />
                                <select className="pg-input sm:col-span-2" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{statuses.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select>
                            </div>
                            <button className="pg-button-primary mt-4 w-full" type="submit">Save Lead</button>
                        </form>
                    </div>
                )}
                {viewLead && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Lead Details</h2><button type="button" onClick={() => setViewLead(null)}>x</button></div>
                            {Object.entries(viewLead).map(([key, value]) => <p className="mb-2 text-sm" key={key}><strong>{key}:</strong> {String(value || "-")}</p>)}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Inquiries;
