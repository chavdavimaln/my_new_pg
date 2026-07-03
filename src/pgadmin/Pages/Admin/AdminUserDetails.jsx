import React, { useMemo } from "react";
import { KeyRound, Mail, MessageCircle, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getAdminUsers, getPermissionsForRoles, getRoleLabels, privilegeOptions } from "../../Utils/adminAuth";
import { pgPath } from "../../Utils/pgBrand";
import { recordHistory } from "../../Utils/historyStore";
import { showErrorPopup, showInfoPopup, showSuccessPopup } from "../../../utils/popup";

const buildMessage = (admin) => `Hello ${admin.name}, this message is from Jay Ambe PG admin panel.`;

const copyManualMessage = async (admin, channel) => {
    const text = channel === "email"
        ? `To: ${admin.email || "-"}\nSubject: Jay Ambe PG Admin Account\n\n${buildMessage(admin)}`
        : `WhatsApp: ${admin.mobile || "-"}\n\n${buildMessage(admin)}`;

    try {
        await navigator.clipboard.writeText(text);
        await showSuccessPopup(
            "Message Copied",
            `${channel === "email" ? "Email" : "WhatsApp"} message copied for manual sending.`,
        );
    } catch {
        await showInfoPopup("Manual Message", text);
    }

    recordHistory({
        module: "Admins",
        entityType: "Admin User",
        entityId: admin.id,
        entityName: admin.name,
        action: "Manual Message Prepared",
        after: { channel, text },
    });
};

const sendDirectEmail = (admin) => {
    if (!admin.email) {
        showErrorPopup("Email Not Available", "Email address is not available for this user.");
        return;
    }
    recordHistory({ module: "Admins", entityType: "Admin User", entityId: admin.id, entityName: admin.name, action: "Email Opened", after: { email: admin.email } });
    window.location.href = `mailto:${admin.email}?subject=${encodeURIComponent("Jay Ambe PG Admin Account")}&body=${encodeURIComponent(buildMessage(admin))}`;
};

const sendDirectWhatsApp = (admin) => {
    if (!admin.mobile) {
        showErrorPopup("Mobile Not Available", "Mobile number is not available for this user.");
        return;
    }
    const phone = String(admin.mobile).replace(/\D/g, "");
    recordHistory({ module: "Admins", entityType: "Admin User", entityId: admin.id, entityName: admin.name, action: "WhatsApp Opened", after: { mobile: admin.mobile } });
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(admin))}`, "_blank", "noopener,noreferrer");
};

const AdminUserDetails = () => {
    const { id } = useParams();
    const admin = getAdminUsers().find((item) => String(item.id) === String(id));
    const permissions = useMemo(() => {
        if (!admin) return [];
        return Array.from(new Set([...(admin.privileges || []), ...getPermissionsForRoles(admin.roles || [admin.role])]));
    }, [admin]);

    if (!admin) {
        return (
            <AdminLayout>
                <div className="rounded-lg bg-white p-6 text-left shadow">
                    <h1 className="text-2xl font-bold">Admin user not found</h1>
                    <Link to={pgPath("/admin/users")} className="mt-4 inline-flex rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white">
                        Back to Users
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">{admin.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">{getRoleLabels(admin)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link to={pgPath(`/admin/users/${admin.id}/edit`)} className="pg-button-primary">
                            <Pencil className="h-5 w-5" />
                            Update
                        </Link>
                        <Link to={pgPath(`/admin/passwords?user=${admin.id}`)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white">
                            <KeyRound className="mr-2 inline h-5 w-5" />
                            Reset Password
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">Profile Details</h2>
                        <dl className="grid gap-4 md:grid-cols-2">
                            <div><dt className="text-sm font-bold text-slate-500">Username</dt><dd className="mt-1 text-slate-900">{admin.username}</dd></div>
                            <div><dt className="text-sm font-bold text-slate-500">Status</dt><dd className="mt-1 text-slate-900">{admin.active === false ? "Inactive" : "Active"}</dd></div>
                            <div><dt className="text-sm font-bold text-slate-500">Email</dt><dd className="mt-1 text-slate-900">{admin.email || "-"}</dd></div>
                            <div><dt className="text-sm font-bold text-slate-500">Mobile / WhatsApp</dt><dd className="mt-1 text-slate-900">{admin.mobile || "-"}</dd></div>
                            <div><dt className="text-sm font-bold text-slate-500">Created</dt><dd className="mt-1 text-slate-900">{admin.createdAt || "-"}</dd></div>
                            <div><dt className="text-sm font-bold text-slate-500">Roles</dt><dd className="mt-1 text-slate-900">{getRoleLabels(admin)}</dd></div>
                        </dl>
                    </section>

                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-bold">Send Message</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button type="button" onClick={() => sendDirectEmail(admin)} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white">
                                <Mail className="h-5 w-5" />
                                Email Direct
                            </button>
                            <button type="button" onClick={() => copyManualMessage(admin, "email")} className="rounded-lg border bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                Email Manual
                            </button>
                            <button type="button" onClick={() => sendDirectWhatsApp(admin)} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white">
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp Direct
                            </button>
                            <button type="button" onClick={() => copyManualMessage(admin, "whatsapp")} className="rounded-lg border bg-white px-4 py-3 text-sm font-bold text-slate-700">
                                WhatsApp Manual
                            </button>
                        </div>
                    </section>
                </div>

                <section className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-bold">Access Permissions</h2>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {privilegeOptions.map((option) => (
                            <span
                                key={option.key}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${permissions.includes(option.key) ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-400"}`}
                            >
                                {option.label}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
};

export default AdminUserDetails;
