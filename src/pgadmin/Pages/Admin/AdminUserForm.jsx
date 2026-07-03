import React, { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../Components/Layout/AdminLayout";
import {
    adminRoles,
    getAdminUsers,
    getCurrentAdmin,
    getPermissionsForRoles,
    isSuperAdmin,
    privilegeOptions,
    roleDefinitions,
    saveAdminUsers,
} from "../../Utils/adminAuth";
import { pgPath } from "../../Utils/pgBrand";
import { recordHistory } from "../../Utils/historyStore";
import { showErrorPopup, showSuccessPopup } from "../../../utils/popup";

const emptyAdmin = {
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    roles: [adminRoles.RECEPTIONIST],
    privileges: ["dashboard"],
    active: true,
};

const AdminUserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentAdmin = getCurrentAdmin();
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState(emptyAdmin);
    const editingId = id || "";

    useEffect(() => {
        const storedAdmins = getAdminUsers();
        setAdmins(storedAdmins);
        const admin = storedAdmins.find((item) => String(item.id) === String(editingId));

        if (admin) {
            const roles = admin.roles?.length ? admin.roles : [admin.role || adminRoles.RECEPTIONIST];
            setFormData({
                name: admin.name || "",
                username: admin.username || "",
                email: admin.email || "",
                mobile: admin.mobile || "",
                password: admin.password || "",
                roles,
                privileges: admin.privileges?.length ? admin.privileges : getPermissionsForRoles(roles),
                active: admin.active !== false,
            });
        }
    }, [editingId]);

    const selectedRoles = useMemo(() => formData.roles || [], [formData.roles]);
    const rolePermissions = useMemo(() => getPermissionsForRoles(selectedRoles), [selectedRoles]);
    const effectivePrivileges = useMemo(
        () => Array.from(new Set([...rolePermissions, ...(formData.privileges || [])])),
        [formData.privileges, rolePermissions],
    );

    const toggleRole = (roleKey) => {
        setFormData((prev) => {
            const roles = prev.roles || [];
            const exists = roles.includes(roleKey);
            const nextRoles = exists ? roles.filter((item) => item !== roleKey) : [...roles, roleKey];
            const normalizedRoles = nextRoles.length ? nextRoles : [adminRoles.RECEPTIONIST];

            return {
                ...prev,
                roles: normalizedRoles,
                privileges: getPermissionsForRoles(normalizedRoles),
            };
        });
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

    const saveAdmin = async () => {
        if (!isSuperAdmin(currentAdmin)) {
            await showErrorPopup("Permission Denied", "Only Super Admin can manage admin users.");
            return;
        }

        if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
            await showErrorPopup("Missing Details", "Please enter name, username, and password.");
            return;
        }

        const usernameExists = admins.some(
            (admin) =>
                String(admin.id) !== String(editingId) &&
                admin.username.toLowerCase() === formData.username.trim().toLowerCase(),
        );
        if (usernameExists) {
            await showErrorPopup("Username Exists", "This username already exists. Please choose another username.");
            return;
        }

        const normalizedRoles = formData.roles?.length ? formData.roles : [adminRoles.RECEPTIONIST];
        const superAdminCount = admins.filter(
            (admin) =>
                (admin.roles || [admin.role]).includes(adminRoles.SUPER) &&
                String(admin.id) !== String(editingId),
        ).length;
        if (normalizedRoles.includes(adminRoles.SUPER) && superAdminCount >= 3) {
            await showErrorPopup("Super Admin Limit", "Maximum 3 super-admin persons are allowed.");
            return;
        }

        const previousAdmin = admins.find((item) => String(item.id) === String(editingId));
        const admin = {
            id: editingId || Date.now(),
            ...formData,
            name: formData.name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
            password: formData.password.trim(),
            roles: normalizedRoles,
            role: normalizedRoles.includes(adminRoles.SUPER) ? adminRoles.SUPER : normalizedRoles[0],
            privileges: getPermissionsForRoles(normalizedRoles),
            createdAt: previousAdmin?.createdAt || new Date().toLocaleDateString(),
        };

        const updatedAdmins = editingId
            ? admins.map((item) => (String(item.id) === String(editingId) ? admin : item))
            : [...admins, admin];

        saveAdminUsers(updatedAdmins);
        recordHistory({
            module: "Admins",
            entityType: "Admin User",
            entityId: admin.id,
            entityName: admin.name,
            action: editingId ? "Updated" : "Created",
            before: previousAdmin,
            after: admin,
        });
        await showSuccessPopup(
            editingId ? "Admin Updated" : "Admin Added",
            editingId ? "Admin user updated successfully." : "Admin user added successfully.",
        );
        navigate(pgPath("/admin/users"));
    };

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">{editingId ? "Update Admin User" : "Add Admin User"}</h1>
                        <p className="mt-1 text-sm text-slate-500">Assign one or more roles using checkboxes.</p>
                    </div>
                    <Link to={pgPath("/admin/users")} className="rounded-lg border bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                        Back to Users
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="mb-2 block font-medium">Name</span>
                            <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="pg-input" />
                        </label>
                        <label>
                            <span className="mb-2 block font-medium">Username</span>
                            <input type="text" value={formData.username} onChange={(event) => setFormData({ ...formData, username: event.target.value })} className="pg-input" />
                        </label>
                        <label>
                            <span className="mb-2 block font-medium">Email</span>
                            <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="pg-input" />
                        </label>
                        <label>
                            <span className="mb-2 block font-medium">Mobile / WhatsApp</span>
                            <input type="text" value={formData.mobile} onChange={(event) => setFormData({ ...formData, mobile: event.target.value })} className="pg-input" />
                        </label>
                        <label>
                            <span className="mb-2 block font-medium">Password</span>
                            <input type="text" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} className="pg-input" />
                        </label>
                    </div>

                    <div className="mt-5">
                        <p className="mb-3 font-medium">Assign Roles</p>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {roleDefinitions.map((role) => (
                                <label key={role.key} className="flex items-start gap-3 rounded-lg border p-3">
                                    <input type="checkbox" checked={selectedRoles.includes(role.key)} onChange={() => toggleRole(role.key)} className="mt-1" />
                                    <span>
                                        <span className="block font-bold text-slate-900">{role.label}</span>
                                        <span className="block text-xs text-slate-500">{role.responsibilities.join(", ")}</span>
                                        {role.limited && <span className="mt-1 block text-xs font-semibold text-amber-700">{role.limited}</span>}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="mb-3 font-medium">Panel Access From Assigned Roles</p>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {privilegeOptions.map((option) => (
                                <label key={option.key} className="flex items-center gap-2 rounded-lg border p-3">
                                    <input
                                        type="checkbox"
                                        checked={effectivePrivileges.includes(option.key)}
                                        disabled={rolePermissions.includes(option.key) || selectedRoles.includes(adminRoles.SUPER)}
                                        onChange={() => togglePrivilege(option.key)}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <label className="mt-5 flex items-center gap-2">
                        <input type="checkbox" checked={formData.active} onChange={(event) => setFormData({ ...formData, active: event.target.checked })} />
                        <span>Active login</span>
                    </label>

                    <div className="mt-5 flex gap-3">
                        <button type="button" onClick={saveAdmin} className="pg-button-primary">
                            <Check className="h-5 w-5" />
                            {editingId ? "Update User" : "Add User"}
                        </button>
                        <Link to={pgPath("/admin/users")} className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-bold text-white">
                            <X className="h-5 w-5" />
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUserForm;
