import { getStoredAllocations, getStoredRooms, getStoredStudents, saveStoredStudents } from "./allocationHelper";
import { recordCollectionHistory, recordHistory } from "./historyStore";
import { formatCurrency, getStoredPayments } from "./paymentHelper";

const ADMISSIONS_KEY = "pgAdmissions";
const EXPENSES_KEY = "pgExpenses";
const SETTINGS_KEY = "pgSettings";
const STAFF_KEY = "pgStaff";
const BUILDINGS_KEY = "pgBuildings";
const MESSAGES_KEY = "pgWhatsAppMessages";
const INQUIRIES_KEY = "pgInquiries";
const TICKETS_KEY = "pgTickets";
const CHAT_THREADS_KEY = "pgChatThreads";
const INVOICES_KEY = "pgInvoices";
const CALENDAR_KEY = "pgCalendarEvents";
const VALIDATION_KEY = "pgValidationPreferences";
const SEND_LOG_KEY = "pgSendLogs";
const TRANSFERS_KEY = "pgTransferHistory";
const ROOM_PROPERTY_ASSIGNMENTS_KEY = "pgRoomPropertyAssignments";

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const readArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

export const writeArray = (key, value) => {
    recordCollectionHistory({
        module: key.replace(/^pg/, "").replace(/([A-Z])/g, " $1").trim() || key,
        entityType: "Record",
        previous: readArray(key),
        next: value,
        action: "Updated",
    });
    localStorage.setItem(key, JSON.stringify((value || []).filter(Boolean)));
};

export const getAdmissions = () => readArray(ADMISSIONS_KEY);
export const saveAdmissions = (items) => writeArray(ADMISSIONS_KEY, items);

export const getExpenses = () => readArray(EXPENSES_KEY);
export const saveExpenses = (items) => writeArray(EXPENSES_KEY, items);

export const getStaff = () => readArray(STAFF_KEY);
export const saveStaff = (items) => writeArray(STAFF_KEY, items);

export const getBuildings = () => {
    const stored = readArray(BUILDINGS_KEY);
    if (stored.length) {
        return stored.map((building) => ({
            ...building,
            floorsList:
                building.floorsList ||
                Array.from({ length: Number(building.floors || 1) }, (_, index) => ({
                    id: `${building.id}-floor-${index}`,
                    name: index === 0 ? "Ground Floor" : `Floor ${index + 1}`,
                    level: index,
                })),
        }));
    }

    const defaults = [
        {
            id: 1,
            name: "Building A",
            address: "Jay Ambe PG",
            floors: 3,
            floorsList: [
                { id: "1-floor-0", name: "Ground Floor", level: 0 },
                { id: "1-floor-1", name: "Floor 2", level: 1 },
                { id: "1-floor-2", name: "Floor 3", level: 2 },
            ],
        },
        {
            id: 2,
            name: "Library Block",
            address: "Jay Ambe PG",
            floors: 2,
            floorsList: [
                { id: "2-floor-0", name: "Ground Floor", level: 0 },
                { id: "2-floor-1", name: "Floor 2", level: 1 },
            ],
        },
    ];
    writeArray(BUILDINGS_KEY, defaults);
    return defaults;
};

export const saveBuildings = (items) => writeArray(BUILDINGS_KEY, items);

export const getWhatsAppMessages = () => readArray(MESSAGES_KEY);
export const saveWhatsAppMessages = (items) => writeArray(MESSAGES_KEY, items);

export const getInquiries = () => readArray(INQUIRIES_KEY);
export const saveInquiries = (items) => writeArray(INQUIRIES_KEY, items);

export const getTickets = () => readArray(TICKETS_KEY);
export const saveTickets = (items) => writeArray(TICKETS_KEY, items);

export const getChatThreads = () => readArray(CHAT_THREADS_KEY);
export const saveChatThreads = (items) => writeArray(CHAT_THREADS_KEY, items);

export const getInvoices = () => readArray(INVOICES_KEY);
export const saveInvoices = (items) => writeArray(INVOICES_KEY, items);

export const getCalendarEvents = () => readArray(CALENDAR_KEY);
export const saveCalendarEvents = (items) => writeArray(CALENDAR_KEY, items);

export const getSendLogs = () => readArray(SEND_LOG_KEY);
export const saveSendLogs = (items) => writeArray(SEND_LOG_KEY, items);

export const getTransferHistory = () => readArray(TRANSFERS_KEY);
export const saveTransferHistory = (items) => writeArray(TRANSFERS_KEY, items);

export const getRoomPropertyAssignments = () => {
    try {
        const value = JSON.parse(localStorage.getItem(ROOM_PROPERTY_ASSIGNMENTS_KEY));
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
};

export const saveRoomPropertyAssignments = (assignments) => {
    recordHistory({
        module: "Room Property Assignments",
        entityType: "Assignment Map",
        entityId: "room-property-assignments",
        entityName: "Room Property Assignments",
        action: "Updated",
        before: getRoomPropertyAssignments(),
        after: assignments,
    });
    localStorage.setItem(ROOM_PROPERTY_ASSIGNMENTS_KEY, JSON.stringify(assignments || {}));
};

export const getValidationPreferences = () => {
    try {
        return {
            enabled: false,
            requirePhone: true,
            requireRoom: false,
            requireDocuments: false,
            requirePaymentAmount: true,
            ...(JSON.parse(localStorage.getItem(VALIDATION_KEY)) || {}),
        };
    } catch {
        return { enabled: false };
    }
};

export const saveValidationPreferences = (preferences) => {
    const before = getValidationPreferences();
    const after = { ...before, ...preferences };
    recordHistory({ module: "Settings", entityType: "Validation Preferences", entityId: "validation", entityName: "Validation Preferences", action: "Updated", before, after });
    localStorage.setItem(VALIDATION_KEY, JSON.stringify(after));
};

export const validateSoft = (values, rules = {}) => {
    const preferences = getValidationPreferences();
    if (!preferences.enabled) return [];

    return Object.entries(rules)
        .filter(([key, required]) => required && !String(values[key] || "").trim())
        .map(([key]) => `${key} is recommended`);
};

export const logSendAction = (action) => {
    const logs = getSendLogs();
    saveSendLogs([{ id: Date.now(), date: todayISO(), ...action }, ...logs]);
};

export const getPgSettings = () => {
    try {
        return {
            rentCycle: "Monthly",
            reminderDays: 5,
            depositRule: "One month rent",
            lateFeeRule: "Rs 100 per delayed day",
            whatsappProvider: "Meta WhatsApp Business API",
            receiptTemplate: "Hello {student}, receipt {receipt} for {amount} is confirmed.",
            ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}),
        };
    } catch {
        return {};
    }
};

export const savePgSettings = (settings) => {
    const before = getPgSettings();
    const after = { ...before, ...settings };
    recordHistory({ module: "Settings", entityType: "PG Settings", entityId: "pg-settings", entityName: "PG Settings", action: "Updated", before, after });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(after));
};

export const approveAdmission = (admissionId) => {
    const admissions = getAdmissions();
    const approvedAdmission = admissions.find((item) => String(item.id) === String(admissionId));
    if (!approvedAdmission) return;

    saveAdmissions(
        admissions.map((item) =>
            String(item.id) === String(admissionId) ? { ...item, status: "Approved", approvedAt: todayISO() } : item,
        ),
    );

    const students = getStoredStudents();
    const alreadyExists = students.some((student) => String(student.phone) === String(approvedAdmission.phone));
    if (!alreadyExists) {
        saveStoredStudents([
            ...students,
            {
                id: Date.now(),
                name: approvedAdmission.name,
                phone: approvedAdmission.phone,
                address: approvedAdmission.address,
                emergencyContact: approvedAdmission.emergencyContact,
                admissionDate: todayISO(),
                status: "Active",
                rentAmount: Number(approvedAdmission.expectedRent || 0),
                depositAmount: Number(approvedAdmission.depositAmount || 0),
            },
        ]);
    }
};

export const getFinancialSummary = () => {
    const payments = getStoredPayments();
    const expenses = getExpenses();
    const income = payments.reduce((total, payment) => total + Number(payment.amount || payment.total || 0), 0);
    const expenseTotal = expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);

    return {
        income,
        expenses: expenseTotal,
        profit: income - expenseTotal,
        incomeLabel: formatCurrency(income),
        expensesLabel: formatCurrency(expenseTotal),
        profitLabel: formatCurrency(income - expenseTotal),
    };
};

export const getPgOverview = () => {
    const rooms = getStoredRooms();
    const students = getStoredStudents();
    const allocations = getStoredAllocations();
    const payments = getStoredPayments();
    const totalBeds = rooms.reduce((total, room) => total + (room.beds?.length || Number(room.bedCount) || 0), 0);
    const occupiedBeds = allocations.filter((allocation) => allocation.bedId).length;
    const pendingPayments = payments.filter((payment) => payment.status !== "Paid").length;
    const renewals = payments.filter((payment) => payment.dueDate).slice(0, 5);
    const financial = getFinancialSummary();

    return {
        rooms,
        students,
        allocations,
        payments,
        totalStudents: students.length,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(totalBeds - occupiedBeds, 0),
        pendingPayments,
        upcomingRenewals: renewals.length,
        ...financial,
    };
};
