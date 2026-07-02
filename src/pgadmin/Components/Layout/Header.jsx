import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu,
    ChevronDown,
    User,
    LogOut,
    Search,
} from "lucide-react";
import { getCurrentAdmin, logoutAdmin } from "../../Utils/adminAuth";
import { PG_BRAND, pgPath } from "../../Utils/pgBrand";

const Header = ({ setSidebarOpen }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const currentAdmin = getCurrentAdmin();

    const logout = () => {
        logoutAdmin();
        navigate(pgPath("/login"), { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 shadow-sm backdrop-blur">
            <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">
                    {/* Mobile section: opens the shared sidebar on small screens. */}
                    <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <Link to={pgPath()} className="text-xl font-black lg:hidden" style={{ color: "var(--pg-primary)" }}>
                        {PG_BRAND.name}
                    </Link>
                </div>

                <div className="hidden max-w-md flex-1 lg:block">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="pg-input pl-9"
                            placeholder="Search rooms, students, payments..."
                            type="search"
                            aria-label="Search admin panel"
                        />
                    </div>
                </div>

                <div className="relative">

                    <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm" onClick={() => setProfileOpen(!profileOpen)}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--pg-primary)" }}>
                            {(currentAdmin?.name || "A").slice(0, 1).toUpperCase()}
                        </span>
                        <span className="hidden text-left sm:block">
                            <span className="block text-sm font-bold text-slate-900">{currentAdmin?.name || "Admin"}</span>
                            <span className="block text-xs text-slate-500">{currentAdmin?.role || "admin"}</span>
                        </span>
                        <ChevronDown size={18} />
                    </button>

                    {profileOpen && (
                        // Profile menu section: keep account links and logout actions here.
                        <div className="absolute right-0 top-14 w-56 rounded-lg border bg-white py-2 text-left shadow-xl">

                            <Link to={pgPath("/admin/profile")} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-purple-50">
                                <User size={18} />
                                Profile
                            </Link>

                            <button
                                type="button"
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
