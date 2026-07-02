import React, { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getStaff, saveStaff } from "../../Utils/pgRequirementStore";

const rolePermissions = {
    Owner: ["All modules", "Staff roles", "Finance approval"],
    Manager: ["Admissions", "Rooms", "Student management", "Reports"],
    Accountant: ["Payments", "Expenses", "Profit reports"],
    Reception: ["Admissions", "Student list", "Reminders"],
};

const StaffManagement = () => {
    const [staff, setStaff] = useState(getStaff());
    const [form, setForm] = useState({ name: "", phone: "", email: "", role: "Manager" });
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sortKey, setSortKey] = useState("name");

    const addStaff = (event) => {
        event.preventDefault();
        const next = [...staff, { ...form, id: Date.now(), permissions: rolePermissions[form.role], active: true }];
        setStaff(next);
        saveStaff(next);
        setForm({ name: "", phone: "", email: "", role: "Manager" });
    };

    const filteredStaff = staff
        .filter((item) => roleFilter === "All" || item.role === roleFilter)
        .filter((item) => `${item.name} ${item.phone} ${item.email} ${item.role}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""), undefined, { numeric: true }));

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader eyebrow="Staff" title="Staff Management & Roles" description="Create staff accounts with owner, manager, accountant, and reception permission sets." />
                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                    <ThemePanel title="Add Staff" description="These accounts can later be synced with admin users or backend auth.">
                        <form className="space-y-4" onSubmit={addStaff}>
                            {["name", "phone", "email"].map((key) => <input className="pg-input" key={key} placeholder={key[0].toUpperCase() + key.slice(1)} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required={key === "name"} />)}
                            <select className="pg-input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                                {Object.keys(rolePermissions).map((role) => <option key={role}>{role}</option>)}
                            </select>
                            <button className="pg-button-primary w-full" type="submit"><Plus size={18} /> Add Staff</button>
                        </form>
                    </ThemePanel>
                    <ThemePanel title="Role Permissions" description="Different roles see different operational responsibilities.">
                        <div className="grid gap-4 md:grid-cols-2">
                            {Object.entries(rolePermissions).map(([role, permissions]) => (
                                <div className="rounded-lg border p-4" key={role}>
                                    <div className="mb-3 flex items-center gap-2 font-black text-slate-900"><ShieldCheck size={18} /> {role}</div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        {permissions.map((permission) => <li key={permission}>- {permission}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </ThemePanel>
                </div>
                <ThemePanel title="Staff Accounts" description="Saved staff members.">
                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <input className="pg-input" placeholder="Search staff..." value={query} onChange={(event) => setQuery(event.target.value)} />
                        <select className="pg-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                            <option>All</option>
                            {Object.keys(rolePermissions).map((role) => <option key={role}>{role}</option>)}
                        </select>
                        <select className="pg-input" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                            <option value="name">Sort by name</option>
                            <option value="role">Sort by role</option>
                            <option value="email">Sort by email</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Role</th><th className="p-3">Permissions</th></tr></thead>
                            <tbody>
                                {filteredStaff.map((item) => (
                                    <tr className="border-t" key={item.id}>
                                        <td className="p-3 font-bold">{item.name}</td>
                                        <td className="p-3">{item.phone || item.email}</td>
                                        <td className="p-3"><span className="pg-badge bg-purple-100 text-purple-700">{item.role}</span></td>
                                        <td className="p-3">{(item.permissions || []).join(", ")}</td>
                                    </tr>
                                ))}
                                {!filteredStaff.length && <tr><td className="p-6 text-center text-slate-400" colSpan="4">No staff matched.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </ThemePanel>
            </div>
        </AdminLayout>
    );
};

export default StaffManagement;
