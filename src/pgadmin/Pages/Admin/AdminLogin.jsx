import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import {
    getAdminUsers,
    sanitizeAdminForSession,
    setCurrentAdmin,
} from "../../Utils/adminAuth";
import { PG_BRAND, pgPath } from "../../Utils/pgBrand";

const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ username: "", password: "" });

    const login = () => {
        const username = formData.username.trim();
        const password = formData.password;

        if (!username || !password) {
            alert("Please enter username and password");
            return;
        }

        const admin = getAdminUsers().find(
            (item) =>
                item.active !== false &&
                item.username.toLowerCase() === username.toLowerCase() &&
                item.password === password,
        );

        if (!admin) {
            alert("Invalid admin login details");
            return;
        }

        setCurrentAdmin(sanitizeAdminForSession(admin));
        navigate(location.state?.from || pgPath(), { replace: true });
    };

    return (
        // Login program: public page, so it uses the theme directly instead of AdminLayout.
        <div className="pg-app-shell flex min-h-screen items-center justify-center p-4">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden p-10 text-white lg:flex lg:flex-col lg:justify-between" style={{ background: "linear-gradient(135deg, var(--pg-sidebar), var(--pg-primary))" }}>
                    <div>
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-xl font-black" style={{ color: "var(--pg-primary)" }}>
                            {PG_BRAND.shortName}
                        </div>
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">{PG_BRAND.name}</p>
                        <h1 className="mt-4 text-4xl font-black leading-tight">Manage rooms, students, payments, and reports from one panel.</h1>
                    </div>
                    <p className="text-sm leading-6 text-white/75">
                        Complete PG and co-living workflow with room design, admissions, accounting, WhatsApp reminders, and staff roles.
                    </p>
                </section>

                <section className="p-6 text-left sm:p-10">
                    <h1 className="pg-page-title">{PG_BRAND.name} Admin Login</h1>
                    <p className="pg-page-subtitle">Default super-admin: superadmin / admin123</p>

                    {/* Form section: use pg-input and pg-button-primary for future login fields/actions. */}
                    <div className="mt-8 space-y-4">
                        <div>
                            <label className="mb-2 block font-semibold text-slate-700" htmlFor="admin-username">
                                Username
                            </label>
                            <input
                                id="admin-username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="pg-input"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold text-slate-700" htmlFor="admin-password">
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pg-input"
                                autoComplete="current-password"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") login();
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={login}
                        className="pg-button-primary mt-6 h-11 w-full"
                    >
                        <LogIn className="h-5 w-5" />
                        Login
                    </button>
                </section>
            </div>
        </div>
    );
};

export default AdminLogin;
