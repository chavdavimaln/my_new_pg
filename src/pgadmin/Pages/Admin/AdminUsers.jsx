import React, { useEffect, useState } from "react";
import { Eye, Mail, MessageCircle, Pencil, Plus, Trash2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getAdminUsers, getCurrentAdmin, getRoleLabels, isSuperAdmin, saveAdminUsers } from "../../Utils/adminAuth";
import { pgPath } from "../../Utils/pgBrand";
import { recordHistory } from "../../Utils/historyStore";
import { showConfirmPopup, showErrorPopup, showSuccessPopup } from "../../../utils/popup";

const openEmail = (admin) => {
    if (!admin.email) {
        showErrorPopup("Email Not Available", "Email address is not available for this user.");
        return;
    }
    window.location.href = `mailto:${admin.email}?subject=${encodeURIComponent("Jay Ambe PG Admin Account")}&body=${encodeURIComponent(`Hello ${admin.name},\n\nThis message is from Jay Ambe PG admin panel.`)}`;
};

const openWhatsApp = (admin) => {
    if (!admin.mobile) {
        showErrorPopup("Mobile Not Available", "Mobile number is not available for this user.");
        return;
    }
    const phone = String(admin.mobile).replace(/\D/g, "");
    const message = encodeURIComponent(`Hello ${admin.name}, this message is from Jay Ambe PG admin panel.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
};

const AdminUsers = () => {
    const currentAdmin = getCurrentAdmin();
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        setAdmins(getAdminUsers());
    }, []);

    const deleteAdmin = async (admin) => {
        if (!isSuperAdmin(currentAdmin)) {
            await showErrorPopup("Permission Denied", "Only Super Admin can delete admin users.");
            return;
        }

        if (String(admin.id) === String(currentAdmin?.id)) {
            await showErrorPopup("Action Not Allowed", "You cannot delete your own admin account.");
            return;
        }

        const confirmed = await showConfirmPopup({
            title: "Delete Admin User?",
            text: `Delete admin user "${admin.name}"? This action cannot be undone.`,
            confirmButtonText: "Delete User",
        });
        if (!confirmed) return;

        const updatedAdmins = admins.filter((item) => String(item.id) !== String(admin.id));
        saveAdminUsers(updatedAdmins);
        recordHistory({
            module: "Admins",
            entityType: "Admin User",
            entityId: admin.id,
            entityName: admin.name,
            action: "Deleted",
            before: admin,
            note: "Admin user removed from active login list",
        });
        setAdmins(updatedAdmins);
        await showSuccessPopup("Admin Deleted", `Admin user "${admin.name}" was deleted successfully.`);
    };

    const columns = [
        { key: "name", header: "Name", accessor: "name" },
        { key: "username", header: "Username", accessor: "username" },
        { key: "email", header: "Email", render: (admin) => admin.email || "-" },
        { key: "mobile", header: "Mobile", render: (admin) => admin.mobile || "-" },
        { key: "role", header: "Roles", sortValue: (admin) => getRoleLabels(admin), render: (admin) => getRoleLabels(admin) },
        { key: "active", header: "Status", render: (admin) => (admin.active === false ? "Inactive" : "Active") },
        {
            key: "action",
            header: "Action",
            sortable: false,
            searchable: false,
            render: (admin) => (
                <div className="flex flex-wrap gap-2">
                    <Link
                        to={pgPath(`/admin/users/${admin.id}`)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-slate-700 text-white"
                        title="View profile"
                        aria-label="View profile"
                    >
                        <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                        to={pgPath(`/admin/users/${admin.id}/edit`)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                        title="Update user"
                        aria-label="Update user"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => openEmail(admin)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-blue-600 text-white"
                        title="Send email"
                        aria-label="Send email"
                    >
                        <Mail className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => openWhatsApp(admin)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-emerald-600 text-white"
                        title="Send WhatsApp"
                        aria-label="Send WhatsApp"
                    >
                        <MessageCircle className="h-4 w-4" />
                    </button>
                    <Link
                        to={pgPath(`/admin/passwords?user=${admin.id}`)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-amber-600 text-white"
                        title="Reset password"
                        aria-label="Reset password"
                    >
                        <KeyRound className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => deleteAdmin(admin)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-red-600 text-white"
                        title="Delete user"
                        aria-label="Delete user"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Users</h1>
                        <p className="mt-1 text-sm text-slate-500">View, contact, update, delete, and reset admin user accounts.</p>
                    </div>
                    <Link to={pgPath("/admin/users/add")} className="pg-button-primary">
                        <Plus className="h-5 w-5" />
                        Add User
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <ResponsiveSortableTable
                        columns={columns}
                        rows={admins}
                        rowKey={(admin) => admin.id}
                        searchPlaceholder="Search admin users..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
