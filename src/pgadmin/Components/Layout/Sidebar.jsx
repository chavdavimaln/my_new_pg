import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    Building2,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageCircle,
    History,
    KeyRound,
    Settings,
    ShieldCheck,
    Users,
    WalletCards,
    Wrench,
    X,
    Repeat2,
} from "lucide-react";
import { getCurrentAdmin, logoutAdmin } from "../../Utils/adminAuth";
import { PG_BRAND, pgPath } from "../../Utils/pgBrand";

const menuItems = [
    { to: "", label: "Dashboard", icon: LayoutDashboard },
    { to: "/action-center", label: "Action Center", icon: Bell },
    { to: "/calendar-operations", label: "Calendar", icon: CalendarDays },
    {
        label: "Properties",
        icon: Building2,
        children: [
            { to: "/property", label: "Buildings/Floors" },
            { to: "/rooms", label: "Room List" },
            { to: "/rooms/add", label: "Add Room" },
            { to: "/student-allocation", label: "Bed Allocation" },
        ],
    },
    { to: "/students", label: "Students", icon: Users },
    { to: "/inquiries", label: "Inquiries", icon: MessageCircle },
    {
        label: "Tickets",
        icon: Wrench,
        children: [
            { to: "/tickets", label: "Dashboard" },
            { to: "/tickets/all", label: "All Tickets" },
            { to: "/tickets/create", label: "Create Ticket" },
            { to: "/tickets/staff", label: "Staff Workload" },
            { to: "/tickets/reports", label: "Reports" },
        ],
    },
    {
        label: "Income",
        icon: WalletCards,
        children: [
            { to: "/payment-operations/dashboard", label: "Dashboard" },
            { to: "/payment-operations/fee-structure", label: "Fee Structure" },
            { to: "/payment-operations/payments", label: "Payments" },
            { to: "/payment-operations/reminders", label: "Reminders" },
            { to: "/payment-operations/security-deposit", label: "Security Deposit" },
            { to: "/payment-operations/refunds", label: "Refunds" },
            { to: "/payment-operations/discounts", label: "Discounts" },
            { to: "/payment-operations/penalty", label: "Late Fee" },
            { to: "/payment-operations/invoices", label: "Invoices" },
            { to: "/payment-operations/receipts", label: "Receipts" },
            { to: "/payment-operations/history", label: "Payment History" },
            { to: "/payment-operations/expenses", label: "Expenses" },
            { to: "/payment-operations/reports", label: "Income Reports" },
            { to: "/payment-operations/financial-dashboard", label: "Financial Dashboard" },
        ],
    },
    { to: "/accounting", label: "Expenses", icon: CreditCard },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/transfers", label: "Transfers", icon: Repeat2 },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    {
        label: "Admin",
        icon: ShieldCheck,
        children: [
            { to: "/admin/users", label: "User List" },
            { to: "/admin/users/add", label: "Add Admin User" },
            { to: "/admin/passwords", label: "Reset Passwords", icon: KeyRound },
            { to: "/staff", label: "Staff / Sub Admins" },
            { to: "/admin/history", label: "History / Audit Logs", icon: History },
        ],
    },
    { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentAdmin = getCurrentAdmin();
    const [openMenus, setOpenMenus] = useState({});

    const closeMobileSidebar = () => setSidebarOpen(false);
    const isActive = (to) => location.pathname === pgPath(to);
    const isChildRouteActive = (to) => {
        const childPath = pgPath(to);
        return location.pathname === childPath || location.pathname.startsWith(`${childPath}/`);
    };
    const hasActiveChild = (children = []) => children.some((child) => isChildRouteActive(child.to));

    const handleLogout = () => {
        logoutAdmin();
        closeMobileSidebar();
        navigate(pgPath("/login"), { replace: true });
    };

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeMobileSidebar} />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-64 transform border-r border-slate-200 bg-white text-slate-700 shadow-xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link to={pgPath()} className="flex items-center gap-3" onClick={closeMobileSidebar}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-black text-white shadow-md">
                            {PG_BRAND.shortName}
                        </span>
                        <span>
                            <span className="block text-base font-black text-violet-700">{PG_BRAND.name}</span>
                            <span className="block text-xs text-slate-500">Co-Living Mgmt</span>
                        </span>
                    </Link>
                    <button className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={closeMobileSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="h-[calc(100vh-7.25rem)] overflow-y-auto px-3 py-3">
                    <ul className="space-y-0.5">
                        {menuItems.map(({ to, label, icon: Icon, children }) => {
                            const activeChild = hasActiveChild(children);
                            const menuOpen = Boolean(openMenus[label] || activeChild);

                            return (
                                <li key={label}>
                                    {children ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setOpenMenus({ ...openMenus, [label]: !openMenus[label] })}
                                            className={`pg-sidebar-link flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition ${
                                                activeChild
                                                    ? "bg-violet-600 text-white shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-violet-700"
                                            }`}
                                        >
                                            <Icon size={15} />
                                            <span className="flex-1 truncate">{label}</span>
                                            {menuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        {menuOpen && (
                                            <ul className="ml-5 mt-1 space-y-0.5 border-l border-violet-100 pl-2">
                                                {children.map((child) => (
                                                    <li key={child.to}>
                                                        <Link
                                                            to={pgPath(child.to)}
                                                            onClick={closeMobileSidebar}
                                                            className={`pg-sidebar-link block rounded-md px-2 py-1.5 transition ${
                                                                isActive(child.to)
                                                                    ? "bg-violet-50 text-violet-700"
                                                                    : "text-slate-500 hover:bg-slate-50 hover:text-violet-700"
                                                            }`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                    ) : (
                                    <Link
                                        to={pgPath(to)}
                                        onClick={closeMobileSidebar}
                                        className={`pg-sidebar-link flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${
                                            isActive(to)
                                                ? "bg-violet-600 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-violet-700"
                                        }`}
                                    >
                                        <Icon size={15} />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t p-3">
                    <div className="mb-2 rounded-lg bg-violet-50 px-3 py-2">
                        <p className="text-sm font-black text-slate-900">{currentAdmin?.name || "Super Admin"}</p>
                        <p className="text-xs text-slate-500">{currentAdmin?.roleLabel || currentAdmin?.role || "Owner"}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
