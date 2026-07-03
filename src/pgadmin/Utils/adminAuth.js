const ADMIN_USERS_KEY = "adminUsers";
const CURRENT_ADMIN_KEY = "currentAdmin";

export const adminRoles = {
    SUPER: "super-admin",
    HOSTEL_ADMIN: "hostel-admin",
    WARDEN: "warden",
    RECEPTIONIST: "receptionist",
    ACCOUNTANT: "accountant",
    MAINTENANCE_MANAGER: "maintenance-manager",
    SECURITY_GUARD: "security-guard",
    MESS_MANAGER: "mess-manager",
    HOUSEKEEPING: "housekeeping",
    SINGLE: "single-admin",
    SUB: "sub-admin",
};

export const privilegeOptions = [
    { key: "dashboard", label: "Dashboard" },
    { key: "rooms", label: "Rooms" },
    { key: "profiles", label: "Profiles" },
    { key: "allocation", label: "Student Allocation" },
    { key: "allotments", label: "Allotment Reports" },
    { key: "payments", label: "Payment Management" },
    { key: "property", label: "Properties" },
    { key: "admissions", label: "Admissions" },
    { key: "inquiries", label: "Inquiries" },
    { key: "tickets", label: "Maintenance Tickets" },
    { key: "messages", label: "Messages" },
    { key: "calendar", label: "Calendar" },
    { key: "transfers", label: "Transfer History" },
    { key: "reports", label: "Reports" },
    { key: "billingSettings", label: "Billing Settings" },
    { key: "hostelSettings", label: "Hostel Settings" },
    { key: "systemConfig", label: "System Configuration" },
    { key: "databaseBackup", label: "Database Backup" },
    { key: "auditLogs", label: "Audit Logs" },
    { key: "staff", label: "Staff Management" },
    { key: "visitors", label: "Visitors / Guests" },
    { key: "attendance", label: "Attendance" },
    { key: "mess", label: "Mess Management" },
    { key: "housekeeping", label: "Housekeeping" },
    { key: "settings", label: "Settings" },
    { key: "adminProfile", label: "Admin Profile" },
    { key: "adminUsers", label: "Admin Users" },
];

const allPrivileges = privilegeOptions.map((option) => option.key);

export const roleDefinitions = [
    {
        key: adminRoles.SUPER,
        label: "Super Admin",
        responsibilities: [
            "Create Admin Users",
            "Delete Users",
            "Reset Passwords",
            "Assign Roles",
            "View All Reports",
            "Billing Settings",
            "Hostel Settings",
            "System Configuration",
            "Database Backup",
            "Audit Logs",
        ],
        permissions: allPrivileges,
        limited: "Full access",
    },
    {
        key: adminRoles.HOSTEL_ADMIN,
        label: "Hostel Admin",
        responsibilities: ["Room Management", "Student Management", "Payments", "Maintenance", "Visitors", "Complaints", "Reports"],
        permissions: ["dashboard", "rooms", "profiles", "allocation", "allotments", "payments", "property", "admissions", "inquiries", "tickets", "messages", "calendar", "transfers", "reports", "visitors"],
        limited: "Cannot delete Super Admin, manage roles, change system settings, or run database backup",
    },
    {
        key: adminRoles.WARDEN,
        label: "Warden / Receptionist",
        responsibilities: ["Student Check-in", "Student Check-out", "Attendance", "Visitor Approval", "Complaint Verification"],
        permissions: ["dashboard", "profiles", "allocation", "admissions", "inquiries", "tickets", "calendar", "visitors", "attendance"],
    },
    {
        key: adminRoles.RECEPTIONIST,
        label: "Receptionist",
        responsibilities: ["New Admission", "Student Registration", "Bed Allocation", "Room Availability", "Inquiry Handling"],
        permissions: ["dashboard", "rooms", "profiles", "allocation", "admissions", "inquiries", "calendar", "visitors"],
    },
    {
        key: adminRoles.ACCOUNTANT,
        label: "Accountant",
        responsibilities: ["Rent Collection", "Generate Invoice", "Expenses", "Refunds", "Reports"],
        permissions: ["dashboard", "payments", "reports", "billingSettings"],
    },
    {
        key: adminRoles.MAINTENANCE_MANAGER,
        label: "Maintenance Manager",
        responsibilities: ["Maintenance Tickets", "Assign Staff", "Track Complaints", "Inventory"],
        permissions: ["dashboard", "tickets", "staff", "reports"],
    },
    {
        key: adminRoles.SECURITY_GUARD,
        label: "Security Guard",
        responsibilities: ["Visitor Entry", "Visitor Exit", "Gate Pass", "Night Attendance"],
        permissions: ["dashboard", "visitors", "attendance"],
    },
    {
        key: adminRoles.MESS_MANAGER,
        label: "Mess Manager",
        responsibilities: ["Food Menu", "Meal Attendance", "Food Stock", "Kitchen Inventory"],
        permissions: ["dashboard", "mess", "reports"],
    },
    {
        key: adminRoles.HOUSEKEEPING,
        label: "Housekeeping",
        responsibilities: ["Cleaning Requests", "Room Cleaning", "Laundry Status"],
        permissions: ["dashboard", "housekeeping", "tickets"],
    },
];

export const getRoleDefinition = (roleKey) => roleDefinitions.find((role) => role.key === roleKey);

export const normalizeAdminRoles = (admin = {}) => {
    if (Array.isArray(admin.roles) && admin.roles.length) return admin.roles;
    if (admin.role === adminRoles.SINGLE) return [adminRoles.HOSTEL_ADMIN];
    if (admin.role === adminRoles.SUB) return [adminRoles.RECEPTIONIST];
    return admin.role ? [admin.role] : [];
};

export const getRoleLabels = (admin = {}) => {
    const labels = normalizeAdminRoles(admin)
        .map((roleKey) => getRoleDefinition(roleKey)?.label || roleKey)
        .filter(Boolean);
    return labels.length ? labels.join(", ") : "-";
};

export const getPermissionsForRoles = (roles = []) => {
    if (roles.includes(adminRoles.SUPER)) return allPrivileges;
    return Array.from(
        new Set(
            roles.flatMap((roleKey) => getRoleDefinition(roleKey)?.permissions || []),
        ),
    );
};

const defaultSuperAdmin = {
    id: 1,
    name: "Main Administrator",
    username: "superadmin",
    email: "admin@example.com",
    mobile: "",
    role: adminRoles.SUPER,
    roles: [adminRoles.SUPER],
    password: "admin123",
    privileges: allPrivileges,
    active: true,
    createdAt: new Date().toLocaleDateString(),
};

const parseStoredArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

export const saveAdminUsers = (admins) => {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins.filter(Boolean)));
};

export const getAdminUsers = () => {
    const admins = parseStoredArray(ADMIN_USERS_KEY);
    if (admins.length) return admins;

    saveAdminUsers([defaultSuperAdmin]);
    return [defaultSuperAdmin];
};

export const getCurrentAdmin = () => {
    try {
        const admin = JSON.parse(localStorage.getItem(CURRENT_ADMIN_KEY));
        return admin?.id ? admin : null;
    } catch {
        return null;
    }
};

export const setCurrentAdmin = (admin) => {
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
};

export const logoutAdmin = () => {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
};

export const isSuperAdmin = (admin = getCurrentAdmin()) => normalizeAdminRoles(admin).includes(adminRoles.SUPER) || admin?.role === adminRoles.SUPER;
export const hasRole = (admin, roleKey) => normalizeAdminRoles(admin).includes(roleKey);

export const hasPrivilege = (admin, privilege) => {
    if (!admin) return false;
    const roles = normalizeAdminRoles(admin);
    if (roles.includes(adminRoles.SUPER) || admin.role === adminRoles.SUPER) return true;
    if (privilege === "payments" && admin.role === adminRoles.SINGLE) return true;
    if (privilege === "adminUsers") return false;
    return [...(admin.privileges || []), ...getPermissionsForRoles(roles)].includes(privilege);
};

export const getRoutePrivilege = (path = "") => {
    const scopedPath = path.startsWith("/pg") ? path.slice(3) || "/" : path;
    if (scopedPath === "/") return "dashboard";
    if (scopedPath.startsWith("/rooms") || scopedPath.startsWith("/beds")) return "rooms";
    if (scopedPath.startsWith("/students")) return "profiles";
    if (scopedPath.startsWith("/student-allocation")) return "allocation";
    if (scopedPath.startsWith("/tables") || scopedPath.startsWith("/cupboards")) return "allotments";
    if (scopedPath.startsWith("/payments") || scopedPath.startsWith("/payment-operations") || scopedPath.startsWith("/accounting")) return "payments";
    if (scopedPath.startsWith("/property")) return "property";
    if (scopedPath.startsWith("/admissions")) return "admissions";
    if (scopedPath.startsWith("/inquiries")) return "inquiries";
    if (scopedPath.startsWith("/tickets")) return "tickets";
    if (scopedPath.startsWith("/messages")) return "messages";
    if (scopedPath.startsWith("/calendar")) return "calendar";
    if (scopedPath.startsWith("/transfers")) return "transfers";
    if (scopedPath.startsWith("/reports")) return "reports";
    if (scopedPath.startsWith("/settings") || scopedPath.startsWith("/whatsapp")) return "settings";
    if (scopedPath.startsWith("/admin/history")) return "auditLogs";
    if (scopedPath.startsWith("/admin/passwords")) return "adminProfile";
    if (scopedPath.startsWith("/admin/users")) return "adminUsers";
    if (scopedPath.startsWith("/staff")) return "staff";
    if (scopedPath.startsWith("/admin/profile")) return "adminProfile";
    return "dashboard";
};

export const sanitizeAdminForSession = (admin) => ({
    id: admin.id,
    name: admin.name,
    username: admin.username,
    email: admin.email,
    mobile: admin.mobile,
    role: normalizeAdminRoles(admin).includes(adminRoles.SUPER) ? adminRoles.SUPER : normalizeAdminRoles(admin)[0],
    roles: normalizeAdminRoles(admin),
    roleLabel: getRoleLabels(admin),
    privileges: Array.from(new Set([...(admin.privileges || []), ...getPermissionsForRoles(normalizeAdminRoles(admin))])),
    active: admin.active !== false,
});
