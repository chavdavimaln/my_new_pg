import React, { useMemo, useState } from "react";
import { Clock, Database, Search } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getHistoryRecords } from "../../Utils/historyStore";

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const HistoryCenter = () => {
    const [query, setQuery] = useState("");
    const [moduleFilter, setModuleFilter] = useState("All");
    const records = getHistoryRecords();

    const modules = useMemo(
        () => ["All", ...Array.from(new Set(records.map((record) => record.module).filter(Boolean))).sort()],
        [records],
    );

    const filteredRecords = records.filter((record) => {
        const haystack = [
            record.module,
            record.entityType,
            record.entityName,
            record.entityId,
            record.action,
            record.adminName,
            record.note,
            JSON.stringify(record.before || {}),
            JSON.stringify(record.after || {}),
        ]
            .join(" ")
            .toLowerCase();

        return (moduleFilter === "All" || record.module === moduleFilter) && haystack.includes(query.toLowerCase());
    });

    const columns = [
        { key: "createdAt", header: "Date", sortValue: (record) => record.createdAt, render: (record) => formatDateTime(record.createdAt) },
        { key: "module", header: "Module", accessor: "module" },
        { key: "entityType", header: "Item Type", accessor: "entityType" },
        { key: "entityName", header: "Name", render: (record) => record.entityName || record.entityId || "-" },
        { key: "action", header: "Action", accessor: "action" },
        { key: "adminName", header: "By", accessor: "adminName" },
        {
            key: "snapshot",
            header: "History",
            sortable: false,
            searchable: false,
            render: (record) => (
                <details className="max-w-xl">
                    <summary className="cursor-pointer font-semibold text-violet-700">View previous / new data</summary>
                    <div className="mt-2 grid gap-2 text-xs md:grid-cols-2">
                        <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-slate-100">{JSON.stringify(record.before || {}, null, 2)}</pre>
                        <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-slate-100">{JSON.stringify(record.after || {}, null, 2)}</pre>
                    </div>
                </details>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase text-violet-700">
                        <Clock className="h-4 w-4" />
                        Audit Logs
                    </p>
                    <h1 className="text-3xl font-black text-slate-900">History Center</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-500">
                        Search previous and current values for admins, students, guests, rooms, payments, staff, settings, tickets, messages, and other PG records.
                    </p>
                </div>

                <div className="rounded-lg bg-white p-4 shadow">
                    <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            <input
                                className="pg-input pl-10"
                                placeholder="Search any item, person, student, guest, admin, action..."
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </label>
                        <select className="pg-input" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
                            {modules.map((moduleName) => (
                                <option key={moduleName} value={moduleName}>
                                    {moduleName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <Database className="h-5 w-5 text-violet-700" />
                            Stored History
                        </h2>
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
                            {filteredRecords.length} records
                        </span>
                    </div>
                    <ResponsiveSortableTable
                        columns={columns}
                        rows={filteredRecords}
                        rowKey={(record) => record.id}
                        searchPlaceholder="Search history table..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default HistoryCenter;
