import React, { useEffect, useState } from "react";
import { Check, Eye, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import {
    adminRoles,
    getAdminUsers,
    getCurrentAdmin,
    isSuperAdmin,
    privilegeOptions,
    saveAdminUsers,
} from "../../Utils/adminAuth";

const emptyAdmin = {
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    role: adminRoles.SUB,
    privileges: ["dashboard"],
    active: true,
};

const AdminUsers = () => {
    const currentAdmin = getCurrentAdmin();
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState(emptyAdmin);
    const [editingId, setEditingId] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    useEffect(() => {
        setAdmins(getAdminUsers());
    }, []);

    const resetForm = () => {
        setFormData(emptyAdmin);
        setEditingId(null);
    };

    const togglePrivilege = (key) => {
        setFormData((prev) => {
            const exists = prev.privileges.includes(key);
            return {
                ...prev,
                privileges: exists ? prev.privileges.filter((item) => item !== key) : [...prev.privileges, key],
            };
        });
    };

    const saveAdmin = () => {
        if (!isSuperAdmin(currentAdmin)) {
            alert("Only super-admin can manage admin users");
            return;
        }

        if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
            alert("Please enter name, username, and password");
            return;
        }

        const usernameExists = admins.some(
            (admin) =>
                String(admin.id) !== String(editingId) &&
                admin.username.toLowerCase() === formData.username.trim().toLowerCase(),
        );
        if (usernameExists) {
            alert("Username already exists");
            return;
        }

        const superAdminCount = admins.filter(
            (admin) => admin.role === adminRoles.SUPER && String(admin.id) !== String(editingId),
        ).length;
        if (formData.role === adminRoles.SUPER && superAdminCount >= 3) {
            alert("Maximum 3 super-admin persons are allowed");
            return;
        }

        const admin = {
            id: editingId || Date.now(),
            ...formData,
            name: formData.name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
            password: formData.password.trim(),
            privileges: formData.role === adminRoles.SUPER ? privilegeOptions.map((option) => option.key) : formData.privileges,
            createdAt: admins.find((item) => String(item.id) === String(editingId))?.createdAt || new Date().toLocaleDateString(),
        };

        const updatedAdmins = editingId
            ? admins.map((item) => (String(item.id) === String(editingId) ? admin : item))
            : [...admins, admin];

        saveAdminUsers(updatedAdmins);
        setAdmins(updatedAdmins);
        resetForm();
    };

    const editAdmin = (admin) => {
        setEditingId(admin.id);
        setFormData({
            name: admin.name || "",
            username: admin.username || "",
            email: admin.email || "",
            mobile: admin.mobile || "",
            password: admin.password || "",
            role: admin.role || adminRoles.SUB,
            privileges: admin.privileges?.length ? admin.privileges : ["dashboard"],
            active: admin.active !== false,
        });
    };

    const deleteAdmin = (admin) => {
        if (String(admin.id) === String(currentAdmin?.id)) {
            alert("You cannot delete your own admin account");
            return;
        }

        const updatedAdmins = admins.filter((item) => String(item.id) !== String(admin.id));
        saveAdminUsers(updatedAdmins);
        setAdmins(updatedAdmins);
        if (String(editingId) === String(admin.id)) resetForm();
    };

    const columns = [
        { key: "name", header: "Name", accessor: "name" },
        { key: "username", header: "Username", accessor: "username" },
        { key: "role", header: "Role", accessor: "role" },
        {
            key: "password",
            header: "Password",
            sortable: false,
            render: (admin) => (
                <div className="flex items-center gap-2">
                    <span>{visiblePasswords[admin.id] ? admin.password : "********"}</span>
                    <button
                        type="button"
                        onClick={() => setVisiblePasswords({ ...visiblePasswords, [admin.id]: !visiblePasswords[admin.id] })}
                        className="flex h-8 w-8 items-center justify-center rounded bg-gray-200"
                        title="View password"
                        aria-label="View password"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
        {
            key: "privileges",
            header: "Access",
            sortValue: (admin) => (admin.privileges || []).join(", "),
            render: (admin) =>
                admin.role === adminRoles.SUPER
                    ? "All access"
                    : privilegeOptions
                          .filter((option) => (admin.privileges || []).includes(option.key))
                          .map((option) => option.label)
                          .join(", ") || "-",
        },
        {
            key: "active",
            header: "Status",
            render: (admin) => (admin.active === false ? "Inactive" : "Active"),
        },
        {
            key: "action",
            header: "Action",
            sortable: false,
            searchable: false,
            render: (admin) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => editAdmin(admin)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                        title="Edit admin"
                        aria-label="Edit admin"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteAdmin(admin)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-red-600 text-white"
                        title="Delete admin"
                        aria-label="Delete admin"
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
                <h1 className="text-3xl font-bold">Admin Users</h1>

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold">{editingId ? "Update Admin Person" : "Add Admin Person"}</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-name">
                                Name
                            </label>
                            <input
                                id="admin-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-username">
                                Username
                            </label>
                            <input
                                id="admin-username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-email">
                                Email
                            </label>
                            <input
                                id="admin-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-mobile">
                                Mobile
                            </label>
                            <input
                                id="admin-mobile"
                                type="text"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-password">
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-medium" htmlFor="admin-role">
                                Admin Type
                            </label>
                            <select
                                id="admin-role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            >
                                <option value={adminRoles.SUPER}>Super Admin</option>
                                <option value={adminRoles.SINGLE}>Single Admin</option>
                                <option value={adminRoles.SUB}>Sub Admin</option>
                            </select>
                        </div>
                    </div>

                    {formData.role !== adminRoles.SUPER && (
                        <div className="mt-5">
                            <p className="mb-3 font-medium">Panel Access</p>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {privilegeOptions
                                    .filter((option) => option.key !== "adminUsers")
                                    .map((option) => (
                                        <label key={option.key} className="flex items-center gap-2 rounded-lg border p-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.privileges.includes(option.key)}
                                                onChange={() => togglePrivilege(option.key)}
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                            </div>
                        </div>
                    )}

                    <label className="mt-5 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <span>Active login</span>
                    </label>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={saveAdmin}
                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600 text-white"
                            title={editingId ? "Update admin" : "Add admin"}
                            aria-label={editingId ? "Update admin" : "Add admin"}
                        >
                            <Check className="h-5 w-5" />
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-600 text-white"
                                title="Cancel edit"
                                aria-label="Cancel edit"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold">Admin Login Persons</h2>
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
