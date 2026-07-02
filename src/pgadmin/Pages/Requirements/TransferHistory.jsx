import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getTransferHistory } from "../../Utils/pgRequirementStore";

const TransferHistory = () => {
    const transfers = getTransferHistory();
    const [query, setQuery] = React.useState("");
    const [sortKey, setSortKey] = React.useState("date");
    const filtered = transfers
        .filter((item) => `${item.date} ${item.studentName} ${item.action} ${item.fromRoom} ${item.toRoom} ${item.reason}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""), undefined, { numeric: true }));

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-black text-orange-600">Room Transfer History</h1>
                    <p className="text-sm text-slate-500">Complete bed assignment, transfer & vacate log</p>
                </div>
                <div className="grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-2">
                    <input className="pg-input" placeholder="Search transfer history..." value={query} onChange={(event) => setQuery(event.target.value)} />
                    <select className="pg-input" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                        <option value="date">Sort by date</option>
                        <option value="studentName">Sort by student</option>
                        <option value="action">Sort by action</option>
                        <option value="fromRoom">Sort by from room</option>
                        <option value="toRoom">Sort by to room</option>
                    </select>
                </div>
                <div className="overflow-x-auto rounded-xl bg-white shadow">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Action</th><th className="p-3">From Room</th><th className="p-3">To Room</th><th className="p-3">Reason</th></tr></thead>
                        <tbody>
                            {filtered.map((item) => <tr className="border-t" key={item.id}><td className="p-3">{item.date}</td><td className="p-3">{item.studentName}</td><td className="p-3">{item.action}</td><td className="p-3">{item.fromRoom}</td><td className="p-3">{item.toRoom}</td><td className="p-3">{item.reason}</td></tr>)}
                            {!filtered.length && <tr><td className="p-8 text-center text-slate-400" colSpan="6">No transfers matched.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TransferHistory;
