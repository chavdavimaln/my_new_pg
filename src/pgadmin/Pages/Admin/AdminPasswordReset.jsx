import React, { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import {
    getAdminUsers,
    getCurrentAdmin,
    getRoleLabels,
    isSuperAdmin,
    saveAdminUsers,
    sanitizeAdminForSession,
    setCurrentAdmin,
} from "../../Utils/adminAuth";
import { recordHistory } from "../../Utils/historyStore";
import { showErrorPopup, showSuccessPopup } from "../../../utils/popup";

const AdminPasswordReset = () => {
    const location = useLocation();
    const currentAdmin = getCurrentAdmin();
    const [admins, setAdmins] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const storedAdmins = getAdminUsers();
        const queryId = new URLSearchParams(location.search).get("user");
        setAdmins(storedAdmins);
        setSelectedId(queryId || currentAdmin?.id || "");
    }, [currentAdmin?.id, location.search]);

    const canResetAll = isSuperAdmin(currentAdmin);
    const visibleAdmins = useMemo(
        () => (canResetAll ? admins : admins.filter((admin) => String(admin.id) === String(currentAdmin?.id))),
        [admins, canResetAll, currentAdmin?.id],
    );
    const selectedAdmin = visibleAdmins.find((admin) => String(admin.id) === String(selectedId));

    const resetPassword = async () => {
        if (!selectedAdmin) {
            await showErrorPopup("User Required", "Please select a user before resetting the password.");
            return;
        }

        if (!canResetAll && String(selectedAdmin.id) !== String(currentAdmin?.id)) {
            await showErrorPopup("Permission Denied", "You can reset only your own password.");
            return;
        }

        if (!password.trim() || password.length < 6) {
            await showErrorPopup("Password Too Short", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            await showErrorPopup("Password Mismatch", "Password confirmation does not match.");
            return;
        }

        const previousAdmin = admins.find((admin) => String(admin.id) === String(selectedAdmin.id));
        const updatedAdmin = { ...previousAdmin, password: password.trim() };
        const updatedAdmins = admins.map((admin) => (String(admin.id) === String(selectedAdmin.id) ? updatedAdmin : admin));

        saveAdminUsers(updatedAdmins);
        setAdmins(updatedAdmins);
        recordHistory({
            module: "Admins",
            entityType: "Admin User",
            entityId: updatedAdmin.id,
            entityName: updatedAdmin.name,
            action: "Password Reset",
            before: { ...previousAdmin, password: "********" },
            after: { ...updatedAdmin, password: "********" },
        });

        if (String(updatedAdmin.id) === String(currentAdmin?.id)) {
            setCurrentAdmin(sanitizeAdminForSession(updatedAdmin));
        }

        setPassword("");
        setConfirmPassword("");
        await showSuccessPopup("Password Reset", "Password reset successfully.");
    };

    const columns = [
        { key: "name", header: "Name", accessor: "name" },
        { key: "username", header: "Username", accessor: "username" },
        { key: "role", header: "Roles", render: (admin) => getRoleLabels(admin) },
        { key: "status", header: "Status", render: (admin) => (admin.active === false ? "Inactive" : "Active") },
        {
            key: "action",
            header: "Action",
            sortable: false,
            searchable: false,
            render: (admin) => (
                <button
                    type="button"
                    onClick={() => setSelectedId(admin.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold ${String(selectedId) === String(admin.id) ? "bg-violet-600 text-white" : "border bg-white text-slate-700"}`}
                >
                    Select
                </button>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div>
                    <p className="flex items-center gap-2 text-sm font-bold uppercase text-violet-700">
                        <KeyRound className="h-4 w-4" />
                        Passwords
                    </p>
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Super Admin can reset any admin password. Other admins can reset only their own password.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">User List</h2>
                        <ResponsiveSortableTable
                            columns={columns}
                            rows={visibleAdmins}
                            rowKey={(admin) => admin.id}
                            searchPlaceholder="Search users..."
                        />
                    </section>

                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-xl font-bold">New Password</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Selected: <span className="font-bold text-slate-800">{selectedAdmin?.name || "None"}</span>
                        </p>
                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="mb-2 block font-medium">New Password</span>
                                <div className="flex rounded-lg border">
                                    <input
                                        type={visible ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="min-w-0 flex-1 rounded-l-lg p-3 outline-none"
                                    />
                                    <button type="button" onClick={() => setVisible(!visible)} className="px-3 text-slate-600">
                                        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </label>
                            <label className="block">
                                <span className="mb-2 block font-medium">Confirm Password</span>
                                <input
                                    type={visible ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    className="pg-input"
                                />
                            </label>
                        </div>
                        <button type="button" onClick={resetPassword} className="pg-button-primary mt-5 w-full justify-center">
                            <Check className="h-5 w-5" />
                            Reset Password
                        </button>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPasswordReset;
