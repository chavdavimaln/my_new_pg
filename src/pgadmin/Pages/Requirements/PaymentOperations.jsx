import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    Bell,
    Calculator,
    ChevronDown,
    CreditCard,
    Download,
    FileText,
    MessageCircle,
    Plus,
    Printer,
    QrCode,
    Receipt,
    Save,
    Search,
    Send,
    WalletCards,
} from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations, getStoredStudents, saveStoredStudents } from "../../Utils/allocationHelper";
import {
    calculateAllocationCharges,
    formatCurrency,
    getPaymentSettings,
    getStoredPayments,
    savePaymentSettings,
    saveStoredPayments,
    toAmount,
} from "../../Utils/paymentHelper";
import { getExpenses, getStaff, logSendAction, saveExpenses, todayISO } from "../../Utils/pgRequirementStore";
import { pgPath } from "../../Utils/pgBrand";
import { showConfirmPopup, showInfoPopup, showSuccessPopup } from "../../../utils/popup";

const incomePages = [
    { key: "dashboard", label: "Payment Dashboard", icon: WalletCards },
    { key: "fee-structure", label: "Fee Structure", icon: Calculator },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "student-payment", label: "Student Payment", icon: CreditCard },
    { key: "collection", label: "Payment Collection", icon: Plus },
    { key: "pending", label: "Pending Payments", icon: Bell },
    { key: "reminders", label: "Due Reminders", icon: Send },
    { key: "security-deposit", label: "Security Deposit", icon: WalletCards },
    { key: "refunds", label: "Refund Management", icon: CreditCard },
    { key: "discounts", label: "Discounts", icon: Calculator },
    { key: "penalty", label: "Late Fee / Penalty", icon: Bell },
    { key: "invoices", label: "Invoices", icon: FileText },
    { key: "receipts", label: "Receipts", icon: Receipt },
    { key: "online-payment", label: "Online Payment", icon: QrCode },
    { key: "history", label: "Payment History", icon: Search },
    { key: "expenses", label: "Expense Management", icon: CreditCard },
    { key: "reports", label: "Income Reports", icon: FileText },
    { key: "financial-dashboard", label: "Financial Dashboard", icon: WalletCards },
];

const paymentModes = ["Cash", "QR Code", "UPI", "Google Pay", "PhonePe", "Paytm", "Bank Transfer", "Credit Card", "Debit Card", "Cheque"];
const paymentStatuses = ["Paid", "Partial", "Pending", "Overdue", "Refunded", "Cancelled"];
const expenseCategories = ["Electricity", "Water", "Salary", "Maintenance", "Furniture", "Cleaning", "Internet", "Food", "Repairs", "Marketing"];
const discountTypes = ["Student Discount", "Festival Offer", "Corporate Discount", "Referral Discount", "Scholarship"];
const reminderStatuses = ["Upcoming Due", "Due Today", "Overdue"];
const reminderChannels = ["SMS", "WhatsApp", "Email", "Push Notification"];
const onlineProviders = ["Cash", "Razorpay", "Stripe", "Cashfree", "PayU", "PhonePe"];
const discountScopes = ["All", "Student", "Guest", "Services"];
const discountModes = ["Amount", "Percent"];
const reportTypes = [
    "Daily Collection",
    "Weekly Collection",
    "Monthly Collection",
    "Yearly Collection",
    "Student Wise Income",
    "Room Wise Income",
    "Payment Method Wise Income",
];

const extraStorageKeys = {
    refunds: "pgRefunds",
    deposits: "pgSecurityDeposits",
    discounts: "pgDiscounts",
    invoices: "pgIncomeInvoices",
    onlinePayments: "pgOnlinePayments",
    staffSalaries: "pgStaffSalarySetup",
};

const readArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

const writeArray = (key, rows) => localStorage.setItem(key, JSON.stringify((rows || []).filter(Boolean)));

const asDate = (value) => (value ? new Date(value) : null);
const daysBetween = (first, second) => Math.ceil((first - second) / 86400000);
const getPaymentDate = (payment) => payment.paymentDate || payment.date || payment.paidDate || payment.createdAt?.slice(0, 10) || "";
const getPaymentAmount = (payment) => toAmount(payment.amount || payment.paid || payment.total || payment.charges?.total);
const getPaymentBalance = (payment) => Math.max(toAmount(payment.balance || payment.pending) || toAmount(payment.total) - toAmount(payment.paid || payment.amount), 0);

const buildStudentOptions = (students, allocations) => {
    const allocationOptions = allocations.map((allocation) => ({
        id: `allocation-${allocation.id}`,
        studentId: allocation.studentId,
        allocationId: allocation.id,
        name: allocation.studentName,
        room: allocation.roomNumber || "",
        bed: allocation.bedLabel || allocation.bedId || "",
        table: allocation.tableLabel || allocation.tableId || "",
        cupboard: allocation.cupboardLabel || allocation.cupboardId || "",
        phone: allocation.phone || "",
        email: allocation.email || "",
        source: allocation,
    }));
    const existingStudentIds = new Set(allocationOptions.map((item) => String(item.studentId)));
    const studentOptions = students
        .filter((student) => !existingStudentIds.has(String(student.id)))
        .map((student) => ({
            id: `student-${student.id}`,
            studentId: student.id,
            allocationId: "",
            name: student.name,
            room: "",
            bed: "",
            table: "",
            cupboard: "",
            phone: student.phone || "",
            email: student.email || "",
            source: student,
        }));

    return [...allocationOptions, ...studentOptions];
};

const badgeClass = (status) => {
    if (["Paid", "Approved", "Refunded"].includes(status)) return "bg-emerald-50 text-emerald-700";
    if (["Partial", "Upcoming Due", "Due Today"].includes(status)) return "bg-amber-50 text-amber-700";
    if (["Overdue", "Pending"].includes(status)) return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-700";
};

const StatCard = ({ label, value, note, tone = "slate" }) => {
    const tones = {
        emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
        amber: "border-amber-100 bg-amber-50 text-amber-700",
        red: "border-red-100 bg-red-50 text-red-700",
        blue: "border-blue-100 bg-blue-50 text-blue-700",
        violet: "border-violet-100 bg-violet-50 text-violet-700",
        slate: "border-slate-100 bg-white text-slate-900",
    };

    return (
        <div className={`rounded-lg border p-4 shadow-sm ${tones[tone] || tones.slate}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
            {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
        </div>
    );
};

const Section = ({ title, children, actions }) => (
    <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
            {actions}
        </div>
        {children}
    </section>
);

const LabeledInput = ({ label, children }) => (
    <label className="block text-sm font-semibold text-slate-700">
        {label}
        <div className="mt-1">{children}</div>
    </label>
);

const AccordionPanel = ({ title, description, open, onToggle, children }) => (
    <div className="rounded-lg border bg-white">
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
            <span>
                <span className="block text-sm font-black text-slate-900">{title}</span>
                {description && <span className="block text-xs text-slate-500">{description}</span>}
            </span>
            <ChevronDown className={`h-5 w-5 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div className="border-t p-4">{children}</div>}
    </div>
);

const MiniBar = ({ label, value, max }) => {
    const width = max ? Math.max(8, Math.min(100, (value / max) * 100)) : 8;
    return (
        <div>
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
                <span>{label}</span>
                <span>{formatCurrency(value)}</span>
            </div>
            <div className="h-2 rounded bg-slate-100">
                <div className="h-2 rounded bg-emerald-500" style={{ width: `${width}%` }} />
            </div>
        </div>
    );
};

const PaymentModeChips = ({ modes, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
            <button
                key={mode}
                type="button"
                onClick={() => onChange(mode)}
                className={`rounded-lg border px-3 py-2 text-sm font-black transition ${
                    value === mode ? "border-emerald-600 bg-emerald-600 text-white" : "bg-white text-slate-600 hover:border-emerald-300"
                }`}
            >
                {mode}
            </button>
        ))}
    </div>
);

const AmountSummary = ({ totals, received = 0, title = "Payment Summary" }) => (
    <div className="rounded-lg border bg-slate-50 p-4">
        <p className="mb-3 text-sm font-black text-slate-700">{title}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Subtotal</p><strong>{formatCurrency(totals.subtotal)}</strong></div>
            <div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">Discount</p><strong>{formatCurrency(totals.discountAmount)}</strong></div>
            <div className="rounded-lg bg-white p-3"><p className="text-xs text-slate-500">GST</p><strong>{formatCurrency(totals.gstAmount)}</strong></div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700"><p className="text-xs">Total Payable</p><strong className="text-lg">{formatCurrency(totals.grandTotal)}</strong></div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-700"><p className="text-xs">Balance</p><strong>{formatCurrency(Math.max(totals.grandTotal - toAmount(received), 0))}</strong></div>
        </div>
    </div>
);

const studentChargeFields = [
    { key: "rent", label: "Rent", feeKey: "monthlyRent", category: "rent" },
    { key: "roomCharge", label: "Room Charge", feeKey: "roomCharge", category: "allocation", requires: "room" },
    { key: "bedCharge", label: "Bed Charge", feeKey: "bedCharge", category: "allocation", requires: "bed" },
    { key: "tableCharge", label: "Table Charge", feeKey: "tableCharge", category: "allocation", requires: "table" },
    { key: "cupboardCharge", label: "Cupboard Charge", feeKey: "cupboardCharge", category: "allocation", requires: "cupboard" },
    { key: "admissionFee", label: "Admission Fee", feeKey: "admissionFee", category: "one_time" },
    { key: "securityDeposit", label: "Security Deposit", feeKey: "securityDeposit", category: "deposit" },
    { key: "maintenance", label: "Maintenance", feeKey: "maintenanceFee", category: "service" },
    { key: "electricity", label: "Electricity", feeKey: "electricity", category: "utility" },
    { key: "water", label: "Water", feeKey: "waterCharges", category: "utility" },
    { key: "wifi", label: "WiFi", feeKey: "wifiCharges", category: "service" },
    { key: "mess", label: "Mess", feeKey: "messCharges", category: "service" },
    { key: "laundry", label: "Laundry", feeKey: "laundryCharges", category: "service" },
    { key: "parking", label: "Parking", feeKey: "parkingCharges", category: "service" },
    { key: "other", label: "Other Charges", feeKey: "otherCharges", category: "other" },
    { key: "penalty", label: "Penalty", feeKey: "lateFee", category: "penalty" },
];

const getSuggestedStudentCharges = (student, feeStructure) => {
    const charges = studentChargeFields.reduce((draft, field) => {
        if (field.requires && !student?.[field.requires]) return draft;
        return { ...draft, [field.key]: toAmount(feeStructure[field.feeKey]) || "" };
    }, {});

    return charges;
};

const buildPaymentLineItems = (form, student, feeStructure) =>
    studentChargeFields
        .filter((field) => !field.requires || student?.[field.requires])
        .map((field) => ({
            key: field.key,
            label: field.label,
            category: field.category,
            linkedAssetType: field.requires || "",
            linkedAssetLabel: field.requires ? student?.[field.requires] || "" : "",
            quantity: 1,
            rate: toAmount(form[field.key]),
            amount: toAmount(form[field.key]),
            sourceFeeKey: field.feeKey,
        }))
        .filter((item) => item.amount > 0);

const getDiscountableAmount = (lineItems, scope) => {
    if (scope === "Services") {
        return lineItems
            .filter((item) => ["service", "utility"].includes(item.category))
            .reduce((total, item) => total + toAmount(item.amount), 0);
    }
    if (scope === "Guest") {
        return lineItems
            .filter((item) => item.category === "guest")
            .reduce((total, item) => total + toAmount(item.amount), 0);
    }
    return lineItems.reduce((total, item) => total + toAmount(item.amount), 0);
};

const calculatePaymentTotals = ({
    lineItems = [],
    discount = 0,
    discountMode = "Amount",
    discountScope = "All",
    gstEnabled = true,
    gstPercent = 0,
    paid = 0,
}) => {
    const subtotal = lineItems.reduce((total, item) => total + toAmount(item.amount), 0);
    const discountableAmount = getDiscountableAmount(lineItems, discountScope);
    const rawDiscount = discountMode === "Percent" ? (discountableAmount * toAmount(discount)) / 100 : toAmount(discount);
    const discountAmount = Math.min(Math.max(rawDiscount, 0), discountableAmount);
    const taxableAmount = Math.max(subtotal - discountAmount, 0);
    const gstAmount = gstEnabled ? (taxableAmount * toAmount(gstPercent)) / 100 : 0;
    const grandTotal = taxableAmount + gstAmount;

    return {
        subtotal,
        discountableAmount,
        discountAmount,
        taxableAmount,
        gstAmount,
        grandTotal,
        balance: Math.max(grandTotal - toAmount(paid), 0),
    };
};

const roundAmount = (value) => Math.round(toAmount(value));

const makeHtmlDocument = (title, body) => `
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
        h1, h2, p { margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
        th { background: #f3f4f6; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 18px; }
        .right { text-align: right; }
    </style>
</head>
<body>${body}</body>
</html>`;

const downloadHtml = (title, body) => {
    const blob = new Blob([makeHtmlDocument(title, body)], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, "-")}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
};

const printHtml = (title, body) => {
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.write(makeHtmlDocument(title, body));
    win.document.close();
    win.print();
};

const PaymentOperations = () => {
    const params = useParams();
    const navigate = useNavigate();
    const activePage = incomePages.some((page) => page.key === params.incomePage) ? params.incomePage : "dashboard";
    const [settings, setSettings] = useState(getPaymentSettings());
    const [payments, setPayments] = useState(getStoredPayments());
    const [expenses, setExpenses] = useState(getExpenses());
    const [deposits, setDeposits] = useState(readArray(extraStorageKeys.deposits));
    const [refunds, setRefunds] = useState(readArray(extraStorageKeys.refunds));
    const [discounts, setDiscounts] = useState(readArray(extraStorageKeys.discounts));
    const [invoices, setInvoices] = useState(readArray(extraStorageKeys.invoices));
    const [onlinePayments, setOnlinePayments] = useState(readArray(extraStorageKeys.onlinePayments));
    const [students, setStudents] = useState(getStoredStudents());
    const [allocations] = useState(getStoredAllocations());
    const [staff] = useState(getStaff());
    const [staffSalaries, setStaffSalaries] = useState(readArray(extraStorageKeys.staffSalaries));
    const [openPriceSections, setOpenPriceSections] = useState({
        assets: true,
        stay: false,
        student: false,
        services: false,
        discount: false,
        salary: false,
    });
    const [historyFilters, setHistoryFilters] = useState({ query: "", range: "Monthly", from: "", to: "", status: "All" });
    const [expenseForm, setExpenseForm] = useState({ category: "Electricity", amount: "", vendor: "", date: todayISO(), billUpload: "", approvedBy: "" });
    const [discountForm, setDiscountForm] = useState({ type: "Student Discount", appliesTo: "All", mode: "Amount", student: "", amount: "", reason: "", validTill: "" });
    const [penaltyForm, setPenaltyForm] = useState({ daysLate: "", manualFee: "", autoCalculate: true });
    const [onlineForm, setOnlineForm] = useState({ provider: "Razorpay", studentKey: "", studentEntryMode: "registered", manualName: "", amount: "", status: "Created", transactionId: "" });
    const studentOptions = useMemo(() => buildStudentOptions(students, allocations), [students, allocations]);
    const [studentPaymentForm, setStudentPaymentForm] = useState({
        studentKey: studentOptions[0]?.id || "",
        month: new Date().toISOString().slice(0, 7),
        rent: "",
        roomCharge: "",
        bedCharge: "",
        tableCharge: "",
        cupboardCharge: "",
        admissionFee: "",
        securityDeposit: "",
        maintenance: "",
        electricity: "",
        water: "",
        wifi: "",
        mess: "",
        laundry: "",
        parking: "",
        other: "",
        penalty: "",
        discount: "",
        discountMode: "Amount",
        discountScope: "All",
        gstEnabled: true,
        gstPercent: settings.feeStructure.gstPercent || "",
        paid: "",
        paymentStatus: "Pending",
    });
    const [collectionForm, setCollectionForm] = useState({
        receiptNo: `RCPT-${Date.now()}`,
        studentKey: studentOptions[0]?.id || "",
        baseAmount: "",
        amount: "",
        discount: "",
        discountMode: "Amount",
        discountScope: "All",
        gstEnabled: true,
        gstPercent: settings.feeStructure.gstPercent || "",
        paymentDate: todayISO(),
        paymentMode: "Cash",
        transactionId: "",
        collectedBy: staff[0]?.name || "Admin",
        remarks: "",
    });
    const [refundForm, setRefundForm] = useState({
        studentKey: studentOptions[0]?.id || "",
        securityDeposit: "",
        damageCharges: "",
        pendingRent: "",
        cleaningCharges: "",
        status: "Pending",
    });
    const [invoiceForm, setInvoiceForm] = useState({
        studentKey: studentOptions[0]?.id || "",
        invoiceNo: `INV-${Date.now()}`,
        month: new Date().toISOString().slice(0, 7),
        rent: "",
        charges: "",
        tax: settings.feeStructure.gstPercent || "",
    });
    const [receiptForm, setReceiptForm] = useState({
        paymentId: payments[0]?.id || "",
        signature: "Authorized Signatory",
    });

    const persistPayments = (rows) => {
        setPayments(rows);
        saveStoredPayments(rows);
    };

    const persistExtra = (key, setter, rows) => {
        setter(rows);
        writeArray(key, rows);
    };

    const persistExpenses = (rows) => {
        setExpenses(rows);
        saveExpenses(rows);
    };

    const updateStaffSalary = (staffMember, field, value) => {
        const existing = staffSalaries.find((item) => String(item.staffId) === String(staffMember.id));
        const nextRow = {
            staffId: staffMember.id,
            name: staffMember.name,
            role: staffMember.role || "Staff",
            salaryType: "Monthly",
            monthlySalary: "",
            perDaySalary: "",
            paymentMode: "Cash",
            status: "Active",
            ...(existing || {}),
            [field]: value,
        };
        const nextRows = existing
            ? staffSalaries.map((item) => (String(item.staffId) === String(staffMember.id) ? nextRow : item))
            : [...staffSalaries, nextRow];
        persistExtra(extraStorageKeys.staffSalaries, setStaffSalaries, nextRows);
    };

    const selectedStudentOption = (key) => studentOptions.find((item) => item.id === key) || studentOptions[0] || {};
    const selectedStudentPayment = selectedStudentOption(studentPaymentForm.studentKey);
    const selectedCollectionStudent = selectedStudentOption(collectionForm.studentKey);
    const selectedOnlineStudent = selectedStudentOption(onlineForm.studentKey);
    const selectedAllocationCharges = calculateAllocationCharges(selectedStudentPayment?.source, settings.feeStructure);

    const now = new Date();
    const today = todayISO();
    const monthKey = today.slice(0, 7);
    const paidPayments = payments.filter((payment) => ["Paid", "Partial", "Deposit"].includes(payment.status || payment.paymentStatus || "Paid"));
    const totalIncome = paidPayments.reduce((total, payment) => total + getPaymentAmount(payment), 0);
    const totalExpenses = expenses.reduce((total, expense) => total + toAmount(expense.amount), 0);
    const pendingAmount = payments.reduce((total, payment) => total + getPaymentBalance(payment), 0);
    const depositTotal =
        deposits.reduce((total, item) => total + toAmount(item.depositReceived), 0) ||
        payments.filter((payment) => String(payment.paymentType || payment.type).toLowerCase().includes("deposit")).reduce((total, payment) => total + getPaymentAmount(payment), 0);
    const refundTotal = refunds.reduce((total, item) => total + toAmount(item.refundAmount), 0);
    const todayCollection = payments.filter((payment) => getPaymentDate(payment) === today).reduce((total, payment) => total + getPaymentAmount(payment), 0);
    const monthCollection = payments.filter((payment) => getPaymentDate(payment).slice(0, 7) === monthKey).reduce((total, payment) => total + getPaymentAmount(payment), 0);
    const collectionRate = totalIncome + pendingAmount ? Math.round((totalIncome / (totalIncome + pendingAmount)) * 100) : 0;

    const studentPaymentLineItems = buildPaymentLineItems(studentPaymentForm, selectedStudentPayment, settings.feeStructure);
    const studentPaymentTotals = calculatePaymentTotals({
        lineItems: studentPaymentLineItems,
        discount: studentPaymentForm.discount,
        discountMode: studentPaymentForm.discountMode,
        discountScope: studentPaymentForm.discountScope,
        gstEnabled: studentPaymentForm.gstEnabled,
        gstPercent: studentPaymentForm.gstPercent || settings.feeStructure.gstPercent,
        paid: studentPaymentForm.paid,
    });
    const studentPaymentTotal = studentPaymentTotals.grandTotal;
    const studentPaymentBalance = studentPaymentTotals.balance;

    const penaltyAmount = penaltyForm.manualFee
        ? toAmount(penaltyForm.manualFee)
        : toAmount(penaltyForm.daysLate) <= 0
          ? 0
          : toAmount(penaltyForm.daysLate) <= 5
            ? 100
            : toAmount(penaltyForm.daysLate) <= 10
              ? 250
              : 500;

    const pendingRows = payments
        .map((payment) => {
            const dueDate = payment.dueDate || payment.paymentDate || payment.date || today;
            const due = asDate(dueDate);
            const daysOverdue = due ? Math.max(0, daysBetween(now, due)) : 0;
            return {
                ...payment,
                amountDue: getPaymentBalance(payment),
                dueDate,
                daysOverdue,
                contactNumber: payment.phone || payment.contactNumber || "",
            };
        })
        .filter((payment) => payment.amountDue > 0 || ["Pending", "Overdue", "Partial"].includes(payment.status || payment.paymentStatus));

    const selectedCollectionDues = pendingRows.filter((payment) => String(payment.studentId) === String(selectedCollectionStudent.studentId));
    const selectedCollectionDueAmount = selectedCollectionDues.reduce((total, payment) => total + toAmount(payment.amountDue), 0);
    const existingCollectionDue = selectedCollectionDues[0];
    const collectionBaseAmount = toAmount(collectionForm.baseAmount || selectedCollectionDueAmount || collectionForm.amount);
    const collectionTotals = calculatePaymentTotals({
        lineItems: collectionBaseAmount
            ? [{ key: "collection", label: "Payment Collection", category: "other", amount: collectionBaseAmount }]
            : [],
        discount: collectionForm.discount,
        discountMode: collectionForm.discountMode,
        discountScope: collectionForm.discountScope,
        gstEnabled: collectionForm.gstEnabled,
        gstPercent: collectionForm.gstPercent || settings.feeStructure.gstPercent,
        paid: collectionForm.amount,
    });
    const collectionPayableAmount = collectionTotals.grandTotal || selectedCollectionDueAmount || studentPaymentTotals.grandTotal || 0;
    const selectedOnlineDues = pendingRows.filter((payment) => String(payment.studentId) === String(selectedOnlineStudent.studentId));
    const selectedOnlineDueAmount = roundAmount(selectedOnlineDues.reduce((total, payment) => total + toAmount(payment.amountDue), 0));
    const onlineAllocationItems = [
        { label: "Room", value: selectedOnlineStudent.room },
        { label: "Bed", value: selectedOnlineStudent.bed },
        { label: "Table", value: selectedOnlineStudent.table },
        { label: "Cupboard", value: selectedOnlineStudent.cupboard },
    ];

    const reminderRows = pendingRows.map((payment) => ({
        ...payment,
        reminderStatus: payment.daysOverdue > 0 ? "Overdue" : payment.dueDate === today ? "Due Today" : "Upcoming Due",
    }));

    const filteredHistory = payments
        .filter((payment) => historyFilters.status === "All" || (payment.status || payment.paymentStatus) === historyFilters.status)
        .filter((payment) => {
            const date = getPaymentDate(payment);
            if (historyFilters.range === "Today") return date === today;
            if (historyFilters.range === "Weekly") return asDate(date) && daysBetween(now, asDate(date)) <= 7;
            if (historyFilters.range === "Monthly") return date.slice(0, 7) === monthKey;
            if (historyFilters.range === "Yearly") return date.slice(0, 4) === today.slice(0, 4);
            if (historyFilters.range === "Custom Date") {
                return (!historyFilters.from || date >= historyFilters.from) && (!historyFilters.to || date <= historyFilters.to);
            }
            return true;
        })
        .filter((payment) =>
            `${payment.studentName} ${payment.roomNumber} ${payment.receiptNo} ${payment.receiptNumber} ${payment.amount} ${payment.status} ${payment.paymentMode}`.toLowerCase().includes(historyFilters.query.toLowerCase()),
        );

    const monthlyChartRows = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        const key = date.toISOString().slice(0, 7);
        return {
            label: date.toLocaleDateString("en-IN", { month: "short" }),
            value: payments.filter((payment) => getPaymentDate(payment).slice(0, 7) === key).reduce((total, payment) => total + getPaymentAmount(payment), 0),
        };
    });
    const maxMonthlyValue = Math.max(...monthlyChartRows.map((item) => item.value), 1);
    const methodTotals = paymentModes
        .map((mode) => ({ label: mode, value: payments.filter((payment) => (payment.paymentMode || payment.method) === mode).reduce((total, payment) => total + getPaymentAmount(payment), 0) }))
        .filter((item) => item.value > 0);
    const reportMax = Math.max(...methodTotals.map((item) => item.value), 1);

    const updateFee = (field, value) => {
        const updated = { ...settings, feeStructure: { ...settings.feeStructure, [field]: value } };
        setSettings(updated);
        savePaymentSettings(updated);
    };

    const loadCollectionPayableAmount = () => {
        const amount = selectedCollectionDueAmount || studentPaymentTotals.grandTotal || collectionTotals.grandTotal || "";
        setCollectionForm({
            ...collectionForm,
            baseAmount: amount,
            amount,
            gstPercent: collectionForm.gstPercent || settings.feeStructure.gstPercent || "",
        });
    };

    const chooseCollectionPaymentMode = (mode) => {
        const apiModes = ["UPI", "Google Pay", "PhonePe", "Paytm", "Credit Card", "Debit Card"];
        setCollectionForm({
            ...collectionForm,
            paymentMode: mode,
            baseAmount: collectionForm.baseAmount || selectedCollectionDueAmount || studentPaymentTotals.grandTotal || "",
        });

        if (mode === "QR Code") {
            showInfoPopup("QR Code Payment", "QR Code selected. The receipt can accept payment from UPI, Google Pay, PhonePe, Paytm, or any QR-supported app.");
            return;
        }

        if (apiModes.includes(mode)) {
            showInfoPopup(`${mode} Payment`, `${mode} selected. When the live payment API is connected, this action can redirect to the ${mode} payment gateway or app flow.`);
        }
    };

    const saveStudentPayment = (event) => {
        event.preventDefault();
        const student = selectedStudentPayment;
        const payment = {
            id: Date.now(),
            receiptNo: `BILL-${Date.now()}`,
            studentName: student.name,
            studentId: student.studentId,
            allocationId: student.allocationId,
            roomNumber: student.room,
            bed: student.bed,
            table: student.table,
            cupboard: student.cupboard,
            month: studentPaymentForm.month,
            rent: toAmount(studentPaymentForm.rent),
            roomCharge: toAmount(studentPaymentForm.roomCharge),
            bedCharge: toAmount(studentPaymentForm.bedCharge),
            tableCharge: toAmount(studentPaymentForm.tableCharge),
            cupboardCharge: toAmount(studentPaymentForm.cupboardCharge),
            admissionFee: toAmount(studentPaymentForm.admissionFee),
            securityDeposit: toAmount(studentPaymentForm.securityDeposit),
            maintenance: toAmount(studentPaymentForm.maintenance),
            electricity: toAmount(studentPaymentForm.electricity),
            water: toAmount(studentPaymentForm.water),
            wifi: toAmount(studentPaymentForm.wifi),
            mess: toAmount(studentPaymentForm.mess),
            laundry: toAmount(studentPaymentForm.laundry),
            parking: toAmount(studentPaymentForm.parking),
            other: toAmount(studentPaymentForm.other),
            penalty: toAmount(studentPaymentForm.penalty),
            discount: studentPaymentTotals.discountAmount,
            discountMode: studentPaymentForm.discountMode,
            discountScope: studentPaymentForm.discountScope,
            gstEnabled: studentPaymentForm.gstEnabled,
            gstPercent: toAmount(studentPaymentForm.gstPercent || settings.feeStructure.gstPercent),
            gstAmount: studentPaymentTotals.gstAmount,
            lineItems: studentPaymentLineItems,
            chargeBreakup: {
                allocationAssets: {
                    room: student.room || "",
                    bed: student.bed || "",
                    table: student.table || "",
                    cupboard: student.cupboard || "",
                },
                calculatedAllocationCharges: selectedAllocationCharges,
                subtotal: studentPaymentTotals.subtotal,
                discountableAmount: studentPaymentTotals.discountableAmount,
                discountAmount: studentPaymentTotals.discountAmount,
                taxableAmount: studentPaymentTotals.taxableAmount,
                gstAmount: studentPaymentTotals.gstAmount,
                grandTotal: studentPaymentTotals.grandTotal,
            },
            subtotal: studentPaymentTotals.subtotal,
            total: studentPaymentTotal,
            paid: toAmount(studentPaymentForm.paid),
            balance: studentPaymentBalance,
            amount: toAmount(studentPaymentForm.paid),
            paymentStatus: studentPaymentBalance ? "Partial" : "Paid",
            status: studentPaymentBalance ? "Partial" : "Paid",
            paymentDate: today,
            dueDate: `${studentPaymentForm.month}-10`,
            paymentType: "Rent",
            phone: student.phone,
            email: student.email,
        };
        persistPayments([payment, ...payments]);
        showSuccessPopup("Student Payment Saved", `${student.name || "Student"} payment bill has been stored.`);
    };

    const saveCollection = (event) => {
        event.preventDefault();
        const student = selectedCollectionStudent;
        const payment = {
            id: Date.now(),
            receiptNo: collectionForm.receiptNo || `RCPT-${Date.now()}`,
            receiptNumber: collectionForm.receiptNo || `RCPT-${Date.now()}`,
            studentName: student.name,
            studentId: student.studentId,
            allocationId: student.allocationId,
            roomNumber: student.room,
            bed: student.bed,
            amount: toAmount(collectionForm.amount),
            baseAmount: collectionBaseAmount,
            subtotal: collectionTotals.subtotal,
            discount: collectionTotals.discountAmount,
            discountMode: collectionForm.discountMode,
            discountScope: collectionForm.discountScope,
            gstEnabled: collectionForm.gstEnabled,
            gstPercent: toAmount(collectionForm.gstPercent || settings.feeStructure.gstPercent),
            gstAmount: collectionTotals.gstAmount,
            total: collectionTotals.grandTotal,
            paid: toAmount(collectionForm.amount),
            balance: Math.max(collectionTotals.grandTotal - toAmount(collectionForm.amount), 0),
            paymentDate: collectionForm.paymentDate,
            date: collectionForm.paymentDate,
            paymentMode: collectionForm.paymentMode,
            transactionId: collectionForm.transactionId,
            collectedBy: collectionForm.collectedBy,
            remarks: collectionForm.remarks,
            paymentType: "Rent",
            paymentStatus: collectionTotals.grandTotal > toAmount(collectionForm.amount) ? "Partial" : "Paid",
            status: collectionTotals.grandTotal > toAmount(collectionForm.amount) ? "Partial" : "Paid",
            phone: student.phone,
            email: student.email,
        };
        persistPayments([payment, ...payments]);
        setCollectionForm({ ...collectionForm, receiptNo: `RCPT-${Date.now()}`, baseAmount: "", amount: "", discount: "", transactionId: "", remarks: "" });
        showSuccessPopup("Payment Collected", `${formatCurrency(payment.amount)} collected from ${student.name || "student"}.`);
    };

    const sendReminder = (payment, channel = "WhatsApp") => {
        logSendAction({ type: channel, module: "income", target: payment.contactNumber || payment.phone || payment.studentName, studentName: payment.studentName });
        showSuccessPopup("Reminder Queued", `${channel} reminder queued for ${payment.studentName || "student"}.`);
    };

    const applyPenalty = (payment) => {
        const fee = payment.daysOverdue <= 5 ? 100 : payment.daysOverdue <= 10 ? 250 : 500;
        persistPayments(payments.map((item) => (item.id === payment.id ? { ...item, penalty: toAmount(item.penalty) + fee, balance: getPaymentBalance(item) + fee, status: "Overdue" } : item)));
        showSuccessPopup("Penalty Applied", `${formatCurrency(fee)} penalty applied.`);
    };

    const saveDeposit = (payment) => {
        const deposit = {
            id: Date.now(),
            studentName: payment.studentName,
            roomNumber: payment.roomNumber,
            depositReceived: getPaymentAmount(payment),
            depositUsed: 0,
            depositRemaining: getPaymentAmount(payment),
            refundStatus: "Not Refunded",
            date: getPaymentDate(payment) || today,
        };
        persistExtra(extraStorageKeys.deposits, setDeposits, [deposit, ...deposits]);
        showSuccessPopup("Deposit Tracked", "Security deposit record added.");
    };

    const saveRefund = (event) => {
        event.preventDefault();
        const student = selectedStudentOption(refundForm.studentKey);
        const refundAmount =
            toAmount(refundForm.securityDeposit) -
            toAmount(refundForm.damageCharges) -
            toAmount(refundForm.pendingRent) -
            toAmount(refundForm.cleaningCharges);
        const refund = { id: Date.now(), ...refundForm, studentName: student.name, roomNumber: student.room, refundAmount: Math.max(0, refundAmount), date: today };
        persistExtra(extraStorageKeys.refunds, setRefunds, [refund, ...refunds]);
        showSuccessPopup("Refund Calculated", `${formatCurrency(refund.refundAmount)} refund saved.`);
    };

    const saveDiscount = (event) => {
        event.preventDefault();
        const discount = { id: Date.now(), ...discountForm, amount: toAmount(discountForm.amount), date: today };
        persistExtra(extraStorageKeys.discounts, setDiscounts, [discount, ...discounts]);
        setDiscountForm({ type: "Student Discount", appliesTo: "All", mode: "Amount", student: "", amount: "", reason: "", validTill: "" });
    };

    const addExpense = (event) => {
        event.preventDefault();
        const expense = { id: Date.now(), expenseNo: `EXP-${Date.now()}`, ...expenseForm, amount: toAmount(expenseForm.amount), status: "Approved" };
        persistExpenses([expense, ...expenses]);
        setExpenseForm({ category: "Electricity", amount: "", vendor: "", date: todayISO(), billUpload: "", approvedBy: "" });
    };

    const saveInvoice = (event) => {
        event.preventDefault();
        const student = selectedStudentOption(invoiceForm.studentKey);
        const total = toAmount(invoiceForm.rent) + toAmount(invoiceForm.charges);
        const taxAmount = (total * toAmount(invoiceForm.tax)) / 100;
        const invoice = {
            id: Date.now(),
            ...invoiceForm,
            studentName: student.name,
            room: student.room,
            total,
            taxAmount,
            grandTotal: total + taxAmount,
            date: today,
        };
        persistExtra(extraStorageKeys.invoices, setInvoices, [invoice, ...invoices]);
        showSuccessPopup("Invoice Generated", `${invoice.invoiceNo} is ready.`);
    };

    const resolveOnlinePaymentPerson = async () => {
        if (onlineForm.studentEntryMode !== "manual") {
            if (!onlineForm.studentKey) return null;
            return {
                name: selectedOnlineStudent.name || "",
                studentId: selectedOnlineStudent.studentId || "",
                studentKey: selectedOnlineStudent.id || "",
                phone: selectedOnlineStudent.phone || "",
                email: selectedOnlineStudent.email || "",
                registered: Boolean(selectedOnlineStudent.studentId),
            };
        }

        const manualName = onlineForm.manualName.trim();
        if (!manualName) return null;

        const existingStudent = students.find((student) => student.name?.trim().toLowerCase() === manualName.toLowerCase());
        if (existingStudent) {
            return {
                name: existingStudent.name,
                studentId: existingStudent.id,
                studentKey: `student-${existingStudent.id}`,
                phone: existingStudent.phone || "",
                email: existingStudent.email || "",
                registered: true,
            };
        }

        const confirmed = await showConfirmPopup({
            title: "Add New Person?",
            text: `${manualName} is not registered yet. Add this name to Student / Person Profiles so it is available throughout the project?`,
            confirmButtonText: "Add Person",
            confirmButtonColor: "#16a34a",
            icon: "question",
        });

        if (!confirmed) {
            return {
                name: manualName,
                studentId: "",
                studentKey: "",
                phone: "",
                email: "",
                registered: false,
            };
        }

        const newStudent = {
            id: Date.now(),
            name: manualName,
            phone: "",
            email: "",
            address: "",
            emergencyContact: "",
            idProofType: "",
            idProofNumber: "",
            joiningDate: today,
            status: "Active",
            notes: "Added from Online Payment manual entry.",
        };
        const nextStudents = [...students, newStudent];
        setStudents(nextStudents);
        saveStoredStudents(nextStudents);

        return {
            name: newStudent.name,
            studentId: newStudent.id,
            studentKey: `student-${newStudent.id}`,
            phone: "",
            email: "",
            registered: true,
        };
    };

    const saveOnlinePayment = async (event) => {
        event.preventDefault();
        const person = await resolveOnlinePaymentPerson();
        if (!person?.name) {
            showInfoPopup("Person Required", "Please select a registered student/person or enter a manual name.");
            return;
        }

        const item = {
            id: Date.now(),
            ...onlineForm,
            student: person.name,
            studentName: person.name,
            studentId: person.studentId,
            studentKey: person.studentKey,
            registeredPerson: person.registered,
            phone: person.phone,
            email: person.email,
            amount: roundAmount(onlineForm.amount),
            date: today,
        };
        persistExtra(extraStorageKeys.onlinePayments, setOnlinePayments, [item, ...onlinePayments]);
        setOnlineForm({ ...onlineForm, amount: "", manualName: person.registered ? "" : onlineForm.manualName, studentKey: person.studentKey || onlineForm.studentKey });
        showSuccessPopup("Payment Link Created", `${onlineForm.provider} transaction has been logged for ${person.name}.`);
    };

    const receiptPayment = payments.find((payment) => String(payment.id) === String(receiptForm.paymentId)) || payments[0];
    const invoiceHtml = (invoice) => `
        <div class="header"><h1>${settings.feeStructure.pgName || "Hostel"} Invoice</h1><p>Invoice No: ${invoice.invoiceNo} | Date: ${invoice.date}</p></div>
        <p><strong>Student:</strong> ${invoice.studentName}</p><p><strong>Room:</strong> ${invoice.room || "-"}</p><p><strong>Month:</strong> ${invoice.month}</p>
        <table><tr><th>Rent</th><th>Charges</th><th>Total</th><th>Tax</th><th>Grand Total</th></tr><tr><td>${formatCurrency(invoice.rent)}</td><td>${formatCurrency(invoice.charges)}</td><td>${formatCurrency(invoice.total)}</td><td>${formatCurrency(invoice.taxAmount)}</td><td>${formatCurrency(invoice.grandTotal)}</td></tr></table>`;
    const receiptHtml = (payment) => `
        <div class="header"><h1>${settings.feeStructure.pgName || "Hostel"} Receipt</h1><p>Receipt No: ${payment.receiptNo || payment.receiptNumber || payment.id}</p></div>
        <p><strong>Date:</strong> ${getPaymentDate(payment)}</p><p><strong>Student:</strong> ${payment.studentName || "-"}</p><p><strong>Amount:</strong> ${formatCurrency(getPaymentAmount(payment))}</p><p><strong>Mode:</strong> ${payment.paymentMode || payment.method || "-"}</p><p><strong>QR Code:</strong> Payment QR / UPI reference</p><p class="right"><strong>${receiptForm.signature}</strong></p>`;

    const renderDashboard = () => (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Today's Collection" value={formatCurrency(todayCollection)} tone="emerald" />
                <StatCard label="This Month Collection" value={formatCurrency(monthCollection)} tone="blue" />
                <StatCard label="Pending Amount" value={formatCurrency(pendingAmount)} tone="amber" />
                <StatCard label="Total Income" value={formatCurrency(totalIncome)} tone="emerald" />
                <StatCard label="Total Expenses" value={formatCurrency(totalExpenses)} tone="red" />
                <StatCard label="Profit" value={formatCurrency(totalIncome - totalExpenses)} tone="violet" />
                <StatCard label="Security Deposits" value={formatCurrency(depositTotal)} tone="blue" />
                <StatCard label="Refund Amount" value={formatCurrency(refundTotal)} tone="amber" />
            </div>
            <Section title="Collection Snapshot">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                        {monthlyChartRows.map((item) => <MiniBar key={item.label} label={item.label} value={item.value} max={maxMonthlyValue} />)}
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-700">Payment Method Wise Income</p>
                        {(methodTotals.length ? methodTotals : [{ label: "No collection yet", value: 0 }]).map((item) => <MiniBar key={item.label} label={item.label} value={item.value} max={reportMax} />)}
                    </div>
                </div>
            </Section>
        </div>
    );

    const renderFeeStructure = () => {
        const toggleSection = (key) => setOpenPriceSections({ ...openPriceSections, [key]: !openPriceSections[key] });
        const priceInput = (key, label, description, type = "number") => (
            <tr className="border-t" key={key}>
                <td className="p-3 font-bold text-slate-800">{label}</td>
                <td className="p-3 text-slate-500">{description}</td>
                <td className="p-3">
                    <input
                        className="pg-input min-w-40"
                        type={type}
                        value={settings.feeStructure[key] || ""}
                        onChange={(event) => updateFee(key, event.target.value)}
                    />
                </td>
            </tr>
        );
        const priceTable = (rows) => (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="p-3">Price Option</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Set Price</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        );
        const salaryRows = staff.map((staffMember) => {
            const salary = staffSalaries.find((item) => String(item.staffId) === String(staffMember.id)) || {};
            return (
                <tr className="border-t" key={staffMember.id}>
                    <td className="p-3 font-bold">{staffMember.name}</td>
                    <td className="p-3">{staffMember.role || "Staff"}</td>
                    <td className="p-3">
                        <select className="pg-input min-w-36" value={salary.salaryType || "Monthly"} onChange={(event) => updateStaffSalary(staffMember, "salaryType", event.target.value)}>
                            <option>Monthly</option>
                            <option>Daily</option>
                            <option>Contract</option>
                        </select>
                    </td>
                    <td className="p-3">
                        <input className="pg-input min-w-36" type="number" value={salary.monthlySalary || ""} onChange={(event) => updateStaffSalary(staffMember, "monthlySalary", event.target.value)} />
                    </td>
                    <td className="p-3">
                        <input className="pg-input min-w-36" type="number" value={salary.perDaySalary || ""} onChange={(event) => updateStaffSalary(staffMember, "perDaySalary", event.target.value)} />
                    </td>
                    <td className="p-3">
                        <select className="pg-input min-w-36" value={salary.paymentMode || "Cash"} onChange={(event) => updateStaffSalary(staffMember, "paymentMode", event.target.value)}>
                            {paymentModes.map((mode) => <option key={mode}>{mode}</option>)}
                        </select>
                    </td>
                </tr>
            );
        });

        return (
            <Section title="Price Setup">
                <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-slate-700">
                    Set all prices used by Income payments from this page. Student Payment can load these values automatically and still allows manual override before saving.
                </div>
                <div className="space-y-3">
                    <AccordionPanel
                        title="Room, Bed, Table And Cupboard Price"
                        description="Asset-linked prices for room allocation and furniture/property usage."
                        open={openPriceSections.assets}
                        onToggle={() => toggleSection("assets")}
                    >
                        {priceTable([
                            priceInput("roomType", "Room Type", "Room category used for fee mapping.", "text"),
                            priceInput("roomCharge", "Room Price", "One-time or allocation room charge."),
                            priceInput("bedCharge", "Bed Price", "Price linked to selected bed."),
                            priceInput("tableCharge", "Table Price", "Price linked to selected study table."),
                            priceInput("cupboardCharge", "Cupboard Price", "Price linked to selected cupboard."),
                        ])}
                    </AccordionPanel>

                    <AccordionPanel
                        title="Student, Guest And Stay Price"
                        description="Manual rates for student fee, guest stay, one-day, two-day, custom-day, monthly and yearly plans."
                        open={openPriceSections.stay}
                        onToggle={() => toggleSection("stay")}
                    >
                        {priceTable([
                            priceInput("studentFeePrice", "Student Fee Price", "Base student fee before optional services."),
                            priceInput("guestPrice", "Guest Price", "Default guest charge."),
                            priceInput("oneDayPrice", "One Day Price", "Single day stay or visitor stay charge."),
                            priceInput("twoDayPrice", "Two Day Price", "Two day stay package."),
                            priceInput("setDaysPrice", "Set Days Price", "Manual custom-day package amount."),
                            priceInput("monthlyRent", "Monthly Price", "Monthly rent charged to student."),
                            priceInput("yearlyPrice", "Yearly Price", "Annual rent or yearly plan."),
                        ])}
                    </AccordionPanel>

                    <AccordionPanel
                        title="Admission, Deposit And Student Charges"
                        description="Core student billing amounts used when creating payment orders."
                        open={openPriceSections.student}
                        onToggle={() => toggleSection("student")}
                    >
                        {priceTable([
                            priceInput("admissionFee", "Admission Fee", "One-time fee at admission."),
                            priceInput("securityDeposit", "Security Deposit", "Deposit received and tracked in deposit ledger."),
                            priceInput("maintenanceFee", "Maintenance Fee", "Monthly or periodic maintenance charge."),
                            priceInput("gstPercent", "GST / Tax %", "Tax percentage applied to invoices."),
                        ])}
                    </AccordionPanel>

                    <AccordionPanel
                        title="Service Charges"
                        description="Utility and hostel service charges that can be added to each payment."
                        open={openPriceSections.services}
                        onToggle={() => toggleSection("services")}
                    >
                        {priceTable([
                            priceInput("electricity", "Electricity Charges", "Electricity fee or meter charge."),
                            priceInput("waterCharges", "Water Charges", "Water service charge."),
                            priceInput("wifiCharges", "WiFi Charges", "Internet/WiFi charge."),
                            priceInput("messCharges", "Mess Charges", "Food/mess charge."),
                            priceInput("laundryCharges", "Laundry Charges", "Laundry service charge."),
                            priceInput("parkingCharges", "Parking Charges", "Vehicle parking charge."),
                            priceInput("otherCharges", "Other Charges", "Any additional manual charge."),
                        ])}
                    </AccordionPanel>

                    <AccordionPanel
                        title="Discount Price"
                        description="Default discount values. Discount Management can create student-wise rules."
                        open={openPriceSections.discount}
                        onToggle={() => toggleSection("discount")}
                    >
                        {priceTable([
                            priceInput("discountPrice", "Set Discount Price", "Default discount amount for manual billing."),
                            priceInput("festivalDiscountPrice", "Festival Discount Price", "Default festival offer amount."),
                            priceInput("scholarshipDiscountPrice", "Scholarship Discount Price", "Default scholarship discount amount."),
                        ])}
                    </AccordionPanel>

                    <AccordionPanel
                        title="Staff Salary Setup"
                        description="Set monthly, daily or contract salary values for staff. These values support expense planning and salary payouts."
                        open={openPriceSections.salary}
                        onToggle={() => toggleSection("salary")}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-3">Staff</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Salary Type</th>
                                        <th className="p-3">Monthly Salary</th>
                                        <th className="p-3">Per Day Salary</th>
                                        <th className="p-3">Payment Mode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryRows}
                                    {!salaryRows.length && <tr><td className="p-6 text-center text-slate-400" colSpan="6">Add staff from Staff Management to configure salary.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </AccordionPanel>
                </div>
            </Section>
        );
    };

    const renderStudentPayment = () => (
        <Section title="Student Payment">
            <form className="space-y-4" onSubmit={saveStudentPayment}>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border p-4">
                        <p className="mb-3 text-sm font-black text-slate-700">Who is paying?</p>
                        <div className="grid gap-3 md:grid-cols-2">
                            <LabeledInput label="Student / Person">
                                <select
                                    className="pg-input"
                                    value={studentPaymentForm.studentKey}
                                    onChange={(event) => {
                                        const student = selectedStudentOption(event.target.value);
                                        setStudentPaymentForm({
                                            ...studentPaymentForm,
                                            studentKey: event.target.value,
                                            gstPercent: studentPaymentForm.gstPercent || settings.feeStructure.gstPercent || "",
                                            ...getSuggestedStudentCharges(student, settings.feeStructure),
                                        });
                                    }}
                                >
                                    {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name}{student.room ? ` - Room ${student.room}` : ""}</option>)}
                                </select>
                            </LabeledInput>
                            <LabeledInput label="Billing Month"><input className="pg-input" type="month" value={studentPaymentForm.month} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, month: event.target.value })} /></LabeledInput>
                            <LabeledInput label="Room"><input className="pg-input" value={selectedStudentPayment.room || ""} readOnly /></LabeledInput>
                            <LabeledInput label="Bed / Table / Cupboard"><input className="pg-input" value={[selectedStudentPayment.bed, selectedStudentPayment.table, selectedStudentPayment.cupboard].filter(Boolean).join(" / ")} readOnly /></LabeledInput>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-emerald-50 p-4">
                        <p className="text-sm font-black text-emerald-700">Amount To Collect</p>
                        <p className="mt-2 text-3xl font-black text-emerald-700">{formatCurrency(studentPaymentTotals.grandTotal)}</p>
                        <p className="mt-1 text-xs text-slate-500">After discount and GST</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white" type="button" onClick={() => setStudentPaymentForm({ ...studentPaymentForm, paid: studentPaymentTotals.grandTotal })}>Full Amount</button>
                            <button className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-700" type="button" onClick={() => setStudentPaymentForm({ ...studentPaymentForm, paid: "" })}>Partial / Later</button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700">Charges And Adjustments</p>
                        <button
                            className="rounded-lg border px-4 py-2 text-sm font-black text-emerald-700"
                            type="button"
                            onClick={() => setStudentPaymentForm({
                                ...studentPaymentForm,
                                gstPercent: studentPaymentForm.gstPercent || settings.feeStructure.gstPercent || "",
                                ...getSuggestedStudentCharges(selectedStudentPayment, settings.feeStructure),
                            })}
                        >
                            Load Suggested Charges
                        </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                    {studentChargeFields
                        .filter((field) => !field.requires || selectedStudentPayment[field.requires])
                        .map((field) => (
                        <LabeledInput key={field.key} label={field.label}>
                            <input className="pg-input" type="number" value={studentPaymentForm[field.key]} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, [field.key]: event.target.value })} />
                        </LabeledInput>
                    ))}
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="mb-3 text-sm font-black text-slate-700">Discount, GST And Received Amount</p>
                    <div className="grid gap-4 md:grid-cols-4">
                        <LabeledInput label="Discount">
                            <input className="pg-input" type="number" value={studentPaymentForm.discount} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discount: event.target.value })} />
                        </LabeledInput>
                        <LabeledInput label="Discount Type">
                            <select className="pg-input" value={studentPaymentForm.discountMode} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discountMode: event.target.value })}>{discountModes.map((mode) => <option key={mode}>{mode}</option>)}</select>
                        </LabeledInput>
                        <LabeledInput label="Discount Applies To">
                            <select className="pg-input" value={studentPaymentForm.discountScope} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discountScope: event.target.value })}>{discountScopes.map((scope) => <option key={scope}>{scope}</option>)}</select>
                        </LabeledInput>
                        <LabeledInput label="Apply GST">
                            <select className="pg-input" value={studentPaymentForm.gstEnabled ? "Yes" : "No"} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, gstEnabled: event.target.value === "Yes" })}><option>Yes</option><option>No</option></select>
                        </LabeledInput>
                        <LabeledInput label="GST %">
                            <input className="pg-input" type="number" value={studentPaymentForm.gstPercent} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, gstPercent: event.target.value })} />
                        </LabeledInput>
                        <LabeledInput label="Amount Received">
                            <input className="pg-input" type="number" value={studentPaymentForm.paid} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, paid: event.target.value })} />
                        </LabeledInput>
                        <LabeledInput label="Payment Status">
                            <select className="pg-input" value={studentPaymentForm.paymentStatus} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, paymentStatus: event.target.value })}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                        </LabeledInput>
                    </div>
                </div>

                <AmountSummary totals={studentPaymentTotals} received={studentPaymentForm.paid} title="Student Payment Calculation" />

                <div className="hidden">
                <div className="grid gap-4 md:grid-cols-4">
                    <LabeledInput label="Student">
                        <select
                            className="pg-input"
                            value={studentPaymentForm.studentKey}
                            onChange={(event) => {
                                const student = selectedStudentOption(event.target.value);
                                setStudentPaymentForm({
                                    ...studentPaymentForm,
                                    studentKey: event.target.value,
                                    gstPercent: studentPaymentForm.gstPercent || settings.feeStructure.gstPercent || "",
                                    ...getSuggestedStudentCharges(student, settings.feeStructure),
                                });
                            }}
                        >
                            {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                        </select>
                    </LabeledInput>
                    <LabeledInput label="Room"><input className="pg-input" value={selectedStudentPayment.room || ""} readOnly /></LabeledInput>
                    <LabeledInput label="Bed"><input className="pg-input" value={selectedStudentPayment.bed || ""} readOnly /></LabeledInput>
                    <LabeledInput label="Table"><input className="pg-input" value={selectedStudentPayment.table || ""} readOnly /></LabeledInput>
                    <LabeledInput label="Cupboard"><input className="pg-input" value={selectedStudentPayment.cupboard || ""} readOnly /></LabeledInput>
                    <LabeledInput label="Month"><input className="pg-input" type="month" value={studentPaymentForm.month} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, month: event.target.value })} /></LabeledInput>
                    <div className="flex items-end">
                        <button
                            className="rounded-lg border px-4 py-3 text-sm font-black text-emerald-700"
                            type="button"
                            onClick={() => setStudentPaymentForm({
                                ...studentPaymentForm,
                                gstPercent: studentPaymentForm.gstPercent || settings.feeStructure.gstPercent || "",
                                ...getSuggestedStudentCharges(selectedStudentPayment, settings.feeStructure),
                            })}
                        >
                            Load Suggested Charges
                        </button>
                    </div>
                    {studentChargeFields
                        .filter((field) => !field.requires || selectedStudentPayment[field.requires])
                        .map((field) => (
                        <LabeledInput key={field.key} label={field.label}>
                            <input className="pg-input" type="number" value={studentPaymentForm[field.key]} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, [field.key]: event.target.value })} />
                        </LabeledInput>
                    ))}
                    <LabeledInput label="Discount">
                        <input className="pg-input" type="number" value={studentPaymentForm.discount} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discount: event.target.value })} />
                    </LabeledInput>
                    <LabeledInput label="Discount Type">
                        <select className="pg-input" value={studentPaymentForm.discountMode} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discountMode: event.target.value })}>{discountModes.map((mode) => <option key={mode}>{mode}</option>)}</select>
                    </LabeledInput>
                    <LabeledInput label="Discount Applies To">
                        <select className="pg-input" value={studentPaymentForm.discountScope} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, discountScope: event.target.value })}>{discountScopes.map((scope) => <option key={scope}>{scope}</option>)}</select>
                    </LabeledInput>
                    <LabeledInput label="Apply GST">
                        <select className="pg-input" value={studentPaymentForm.gstEnabled ? "Yes" : "No"} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, gstEnabled: event.target.value === "Yes" })}><option>Yes</option><option>No</option></select>
                    </LabeledInput>
                    <LabeledInput label="GST %">
                        <input className="pg-input" type="number" value={studentPaymentForm.gstPercent} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, gstPercent: event.target.value })} />
                    </LabeledInput>
                    <LabeledInput label="Paid">
                        <input className="pg-input" type="number" value={studentPaymentForm.paid} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, paid: event.target.value })} />
                    </LabeledInput>
                    <LabeledInput label="Subtotal"><input className="pg-input" value={formatCurrency(studentPaymentTotals.subtotal)} readOnly /></LabeledInput>
                    <LabeledInput label="Discount Amount"><input className="pg-input" value={formatCurrency(studentPaymentTotals.discountAmount)} readOnly /></LabeledInput>
                    <LabeledInput label="GST Amount"><input className="pg-input" value={formatCurrency(studentPaymentTotals.gstAmount)} readOnly /></LabeledInput>
                    <LabeledInput label="Total"><input className="pg-input" value={formatCurrency(studentPaymentTotal)} readOnly /></LabeledInput>
                    <LabeledInput label="Balance"><input className="pg-input" value={formatCurrency(studentPaymentBalance)} readOnly /></LabeledInput>
                    <LabeledInput label="Payment Status">
                        <select className="pg-input" value={studentPaymentForm.paymentStatus} onChange={(event) => setStudentPaymentForm({ ...studentPaymentForm, paymentStatus: event.target.value })}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                    </LabeledInput>
                </div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-black text-slate-700">Payment Calculation</p>
                    <div className="grid gap-2 md:grid-cols-2">
                        {studentPaymentLineItems.map((item) => (
                            <div className="flex justify-between rounded border bg-white px-3 py-2 text-sm" key={item.key}>
                                <span>{item.label}{item.linkedAssetLabel ? ` (${item.linkedAssetLabel})` : ""}</span>
                                <strong>{formatCurrency(item.amount)}</strong>
                            </div>
                        ))}
                        {!studentPaymentLineItems.length && <p className="text-sm text-slate-500">No charge lines yet. Load suggested charges or enter values manually.</p>}
                    </div>
                    <div className="mt-4 grid gap-2 rounded-lg bg-white p-3 text-sm md:grid-cols-5">
                        <strong>Subtotal: {formatCurrency(studentPaymentTotals.subtotal)}</strong>
                        <strong>Discount: {formatCurrency(studentPaymentTotals.discountAmount)}</strong>
                        <strong>GST: {formatCurrency(studentPaymentTotals.gstAmount)}</strong>
                        <strong>Total Payable: {formatCurrency(studentPaymentTotals.grandTotal)}</strong>
                        <strong>Balance: {formatCurrency(studentPaymentTotals.balance)}</strong>
                    </div>
                </div>
                <button className="pg-button-success" type="submit"><Save size={18} /> Save Student Payment</button>
            </form>
        </Section>
    );

    const renderCollection = () => (
        <Section title="Collect Payments">
            <form className="space-y-4" onSubmit={saveCollection}>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border p-4">
                        <p className="mb-3 text-sm font-black text-slate-700">Select payer and payable amount</p>
                        <div className="grid gap-4 md:grid-cols-3">
                <LabeledInput label="Receipt No"><input className="pg-input" value={collectionForm.receiptNo} onChange={(event) => setCollectionForm({ ...collectionForm, receiptNo: event.target.value })} /></LabeledInput>
                <LabeledInput label="Student">
                    <select className="pg-input" value={collectionForm.studentKey} onChange={(event) => setCollectionForm({ ...collectionForm, studentKey: event.target.value })}>{studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select>
                </LabeledInput>
                <LabeledInput label="Base Amount / Due">
                    <input className="pg-input" type="number" value={collectionForm.baseAmount} onChange={(event) => setCollectionForm({ ...collectionForm, baseAmount: event.target.value })} />
                </LabeledInput>
                <LabeledInput label="Discount">
                    <input className="pg-input" type="number" value={collectionForm.discount} onChange={(event) => setCollectionForm({ ...collectionForm, discount: event.target.value })} />
                </LabeledInput>
                <LabeledInput label="Discount Type">
                    <select className="pg-input" value={collectionForm.discountMode} onChange={(event) => setCollectionForm({ ...collectionForm, discountMode: event.target.value })}>{discountModes.map((mode) => <option key={mode}>{mode}</option>)}</select>
                </LabeledInput>
                <LabeledInput label="Discount Applies To">
                    <select className="pg-input" value={collectionForm.discountScope} onChange={(event) => setCollectionForm({ ...collectionForm, discountScope: event.target.value })}>{discountScopes.map((scope) => <option key={scope}>{scope}</option>)}</select>
                </LabeledInput>
                <LabeledInput label="Apply GST">
                    <select className="pg-input" value={collectionForm.gstEnabled ? "Yes" : "No"} onChange={(event) => setCollectionForm({ ...collectionForm, gstEnabled: event.target.value === "Yes" })}><option>Yes</option><option>No</option></select>
                </LabeledInput>
                <LabeledInput label="GST %">
                    <input className="pg-input" type="number" value={collectionForm.gstPercent} onChange={(event) => setCollectionForm({ ...collectionForm, gstPercent: event.target.value })} />
                </LabeledInput>
                <LabeledInput label="Amount Received"><input className="pg-input" type="number" value={collectionForm.amount} onChange={(event) => setCollectionForm({ ...collectionForm, amount: event.target.value })} required /></LabeledInput>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-emerald-50 p-4">
                        <p className="text-sm font-black text-emerald-700">Collect Now</p>
                        <button
                            className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-700"
                            type="button"
                            onClick={loadCollectionPayableAmount}
                        >
                            Load Payable Amount
                        </button>
                        <p className="mt-3 text-3xl font-black text-emerald-700">{formatCurrency(collectionPayableAmount)}</p>
                        <p className="mt-1 text-xs text-slate-500">Total payable after discount and GST</p>
                        {selectedCollectionDueAmount > 0 && <p className="mt-1 text-xs font-bold text-emerald-700">Pending due loaded: {formatCurrency(selectedCollectionDueAmount)} from {selectedCollectionDues.length} record(s)</p>}
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white" type="button" onClick={() => setCollectionForm({ ...collectionForm, baseAmount: collectionBaseAmount || collectionPayableAmount, amount: collectionPayableAmount })}>Receive Full</button>
                            <button className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-700" type="button" onClick={() => setCollectionForm({ ...collectionForm, amount: "" })}>Partial</button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="mb-3 text-sm font-black text-slate-700">Payment method</p>
                    <PaymentModeChips modes={paymentModes} value={collectionForm.paymentMode} onChange={chooseCollectionPaymentMode} />
                    {collectionForm.paymentMode === "QR Code" && (
                        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-slate-700">
                            <p className="font-black text-emerald-700">QR Code Payment Ready</p>
                            <p className="mt-1">Any QR-supported app can pay this amount. Amount: <strong>{formatCurrency(collectionPayableAmount)}</strong></p>
                        </div>
                    )}
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                <LabeledInput label="Payment Date"><input className="pg-input" type="date" value={collectionForm.paymentDate} onChange={(event) => setCollectionForm({ ...collectionForm, paymentDate: event.target.value })} /></LabeledInput>
                <LabeledInput label="Transaction ID"><input className="pg-input" value={collectionForm.transactionId} onChange={(event) => setCollectionForm({ ...collectionForm, transactionId: event.target.value })} /></LabeledInput>
                <LabeledInput label="Collected By"><input className="pg-input" value={collectionForm.collectedBy} onChange={(event) => setCollectionForm({ ...collectionForm, collectedBy: event.target.value })} /></LabeledInput>
                <LabeledInput label="Remarks"><input className="pg-input" value={collectionForm.remarks} onChange={(event) => setCollectionForm({ ...collectionForm, remarks: event.target.value })} /></LabeledInput>
                    </div>
                </div>
                <div className="md:col-span-3 rounded-lg border bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-black text-slate-700">Collection Calculation</p>
                    <div className="grid gap-2 text-sm md:grid-cols-5">
                        <strong>Subtotal: {formatCurrency(collectionTotals.subtotal)}</strong>
                        <strong>Discount: {formatCurrency(collectionTotals.discountAmount)}</strong>
                        <strong>GST: {formatCurrency(collectionTotals.gstAmount)}</strong>
                        <strong>Total Payable: {formatCurrency(collectionTotals.grandTotal)}</strong>
                        <strong>Balance After Receive: {formatCurrency(collectionTotals.balance)}</strong>
                    </div>
                    {selectedCollectionDueAmount > 0 && <p className="mt-2 text-xs text-slate-500">Existing due found for {selectedCollectionStudent.name}: {formatCurrency(selectedCollectionDueAmount)} from {selectedCollectionDues.length} pending record(s).</p>}
                </div>
                <button className="pg-button-success w-full justify-center" type="submit"><Save size={18} /> Collect Payment</button>
            </form>
        </Section>
    );

    const renderPending = () => (
        <Section title="Pending Payments">
            <ResponsiveSortableTable
                columns={[
                    { key: "studentName", header: "Student Name", accessor: "studentName" },
                    { key: "roomNumber", header: "Room", accessor: "roomNumber" },
                    { key: "amountDue", header: "Amount Due", sortValue: (row) => row.amountDue, render: (row) => formatCurrency(row.amountDue) },
                    { key: "dueDate", header: "Due Date", accessor: "dueDate" },
                    { key: "daysOverdue", header: "Days Overdue", accessor: "daysOverdue" },
                    { key: "contactNumber", header: "Contact Number", accessor: "contactNumber" },
                    { key: "actions", header: "Actions", sortable: false, searchable: false, render: (row) => <div className="flex flex-wrap gap-2"><button className="rounded border p-2 text-emerald-700" type="button" onClick={() => sendReminder(row)} title="Send reminder"><MessageCircle size={16} /></button><button className="rounded border p-2 text-blue-700" type="button" onClick={() => navigate(pgPath("/payment-operations/payments"))} title="Collect payment"><CreditCard size={16} /></button><button className="rounded border p-2 text-red-700" type="button" onClick={() => applyPenalty(row)} title="Apply penalty"><Calculator size={16} /></button></div> },
                ]}
                rows={pendingRows}
                rowKey={(row) => row.id}
                searchPlaceholder="Search pending payments..."
            />
        </Section>
    );

    const renderReminders = () => (
        <Section title="Due Payment Reminder">
            <div className="mb-4 flex flex-wrap gap-2">{reminderStatuses.map((status) => <span key={status} className={`rounded-full px-3 py-1 text-xs font-black ${badgeClass(status)}`}>{status}</span>)}</div>
            <ResponsiveSortableTable
                columns={[
                    { key: "studentName", header: "Student", accessor: "studentName" },
                    { key: "dueDate", header: "Due Date", accessor: "dueDate" },
                    { key: "reminderStatus", header: "Status", render: (row) => <span className={`rounded-full px-2 py-1 text-xs font-bold ${badgeClass(row.reminderStatus)}`}>{row.reminderStatus}</span> },
                    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amountDue) },
                    { key: "channels", header: "Notification Methods", sortable: false, searchable: false, render: (row) => <div className="flex flex-wrap gap-2">{reminderChannels.map((channel) => <button key={channel} type="button" className="rounded border px-2 py-1 text-xs font-bold" onClick={() => sendReminder(row, channel)}>{channel}</button>)}</div> },
                ]}
                rows={reminderRows}
                rowKey={(row) => row.id}
                searchPlaceholder="Search reminders..."
            />
        </Section>
    );

    const renderSecurityDeposit = () => (
        <div className="space-y-5">
            <Section title="Track Security Deposits" actions={<button className="rounded border px-3 py-2 text-sm font-bold" type="button" onClick={() => payments.filter((payment) => String(payment.paymentType || payment.type).toLowerCase().includes("deposit")).forEach(saveDeposit)}>Import Deposit Payments</button>}>
                <ResponsiveSortableTable
                    columns={[
                        { key: "studentName", header: "Student", accessor: "studentName" },
                        { key: "depositReceived", header: "Deposit Received", render: (row) => formatCurrency(row.depositReceived) },
                        { key: "depositUsed", header: "Deposit Used", render: (row) => formatCurrency(row.depositUsed) },
                        { key: "depositRemaining", header: "Deposit Remaining", render: (row) => formatCurrency(row.depositRemaining) },
                        { key: "refundStatus", header: "Refund Status", render: (row) => <span className={`rounded-full px-2 py-1 text-xs font-bold ${badgeClass(row.refundStatus)}`}>{row.refundStatus}</span> },
                    ]}
                    rows={deposits}
                    rowKey={(row) => row.id}
                />
            </Section>
        </div>
    );

    const renderRefunds = () => {
        const refundAmount = Math.max(0, toAmount(refundForm.securityDeposit) - toAmount(refundForm.damageCharges) - toAmount(refundForm.pendingRent) - toAmount(refundForm.cleaningCharges));
        return (
            <div className="space-y-5">
                <Section title="Refund Management During Checkout">
                    <form className="grid gap-4 md:grid-cols-3" onSubmit={saveRefund}>
                        <LabeledInput label="Student"><select className="pg-input" value={refundForm.studentKey} onChange={(event) => setRefundForm({ ...refundForm, studentKey: event.target.value })}>{studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></LabeledInput>
                        {["securityDeposit", "damageCharges", "pendingRent", "cleaningCharges"].map((field) => <LabeledInput key={field} label={field.replace(/([A-Z])/g, " $1")}><input className="pg-input" type="number" value={refundForm[field]} onChange={(event) => setRefundForm({ ...refundForm, [field]: event.target.value })} /></LabeledInput>)}
                        <LabeledInput label="Refund Amount"><input className="pg-input" value={formatCurrency(refundAmount)} readOnly /></LabeledInput>
                        <LabeledInput label="Refund Status"><select className="pg-input" value={refundForm.status} onChange={(event) => setRefundForm({ ...refundForm, status: event.target.value })}><option>Pending</option><option>Approved</option><option>Refunded</option></select></LabeledInput>
                        <div className="flex items-end"><button className="pg-button-primary w-full" type="submit"><Save size={18} /> Save Refund</button></div>
                    </form>
                </Section>
                <ResponsiveSortableTable columns={[{ key: "studentName", header: "Student", accessor: "studentName" }, { key: "securityDeposit", header: "Security Deposit", render: (row) => formatCurrency(row.securityDeposit) }, { key: "refundAmount", header: "Refund Amount", render: (row) => formatCurrency(row.refundAmount) }, { key: "status", header: "Status", accessor: "status" }]} rows={refunds} rowKey={(row) => row.id} />
            </div>
        );
    };

    const renderDiscounts = () => (
        <div className="space-y-5">
            <Section title="Discount Management">
                <form className="grid gap-4 md:grid-cols-7" onSubmit={saveDiscount}>
                    <select className="pg-input" value={discountForm.type} onChange={(event) => setDiscountForm({ ...discountForm, type: event.target.value })}>{discountTypes.map((type) => <option key={type}>{type}</option>)}</select>
                    <select className="pg-input" value={discountForm.appliesTo} onChange={(event) => setDiscountForm({ ...discountForm, appliesTo: event.target.value })}>{discountScopes.map((scope) => <option key={scope}>{scope}</option>)}</select>
                    <select className="pg-input" value={discountForm.mode} onChange={(event) => setDiscountForm({ ...discountForm, mode: event.target.value })}>{discountModes.map((mode) => <option key={mode}>{mode}</option>)}</select>
                    <input className="pg-input" placeholder="Student" value={discountForm.student} onChange={(event) => setDiscountForm({ ...discountForm, student: event.target.value })} />
                    <input className="pg-input" type="number" placeholder="Amount" value={discountForm.amount} onChange={(event) => setDiscountForm({ ...discountForm, amount: event.target.value })} />
                    <input className="pg-input" placeholder="Reason" value={discountForm.reason} onChange={(event) => setDiscountForm({ ...discountForm, reason: event.target.value })} />
                    <button className="pg-button-primary" type="submit"><Plus size={18} /> Add Discount</button>
                </form>
            </Section>
            <ResponsiveSortableTable columns={[
                { key: "type", header: "Discount Type", accessor: "type" },
                { key: "appliesTo", header: "Applies To", accessor: "appliesTo" },
                { key: "mode", header: "Mode", accessor: "mode" },
                { key: "student", header: "Student / Guest", accessor: "student" },
                { key: "amount", header: "Discount", render: (row) => row.mode === "Percent" ? `${row.amount}%` : formatCurrency(row.amount) },
                { key: "reason", header: "Reason", accessor: "reason" },
            ]} rows={discounts} rowKey={(row) => row.id} />
        </div>
    );

    const renderPenalty = () => (
        <Section title="Late Fee / Penalty">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-lg border p-4">
                    <p className="font-black">Automatic Rules</p>
                    <div className="mt-3 space-y-2 text-sm">
                        <p>1-5 Days Late: <strong>{formatCurrency(100)}</strong></p>
                        <p>6-10 Days: <strong>{formatCurrency(250)}</strong></p>
                        <p>More than 10 Days: <strong>{formatCurrency(500)}</strong></p>
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <LabeledInput label="Days Late"><input className="pg-input" type="number" value={penaltyForm.daysLate} onChange={(event) => setPenaltyForm({ ...penaltyForm, daysLate: event.target.value })} /></LabeledInput>
                        <LabeledInput label="Manual Fee / Penalty"><input className="pg-input" type="number" value={penaltyForm.manualFee} onChange={(event) => setPenaltyForm({ ...penaltyForm, manualFee: event.target.value })} /></LabeledInput>
                    </div>
                    <p className="mt-4 text-2xl font-black text-red-600">{formatCurrency(penaltyAmount)}</p>
                </div>
            </div>
        </Section>
    );

    const renderInvoices = () => (
        <div className="space-y-5">
            <Section title="Invoice Generation">
                <form className="grid gap-4 md:grid-cols-4" onSubmit={saveInvoice}>
                    <LabeledInput label="Student"><select className="pg-input" value={invoiceForm.studentKey} onChange={(event) => setInvoiceForm({ ...invoiceForm, studentKey: event.target.value })}>{studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></LabeledInput>
                    <LabeledInput label="Invoice No"><input className="pg-input" value={invoiceForm.invoiceNo} onChange={(event) => setInvoiceForm({ ...invoiceForm, invoiceNo: event.target.value })} /></LabeledInput>
                    <LabeledInput label="Month"><input className="pg-input" type="month" value={invoiceForm.month} onChange={(event) => setInvoiceForm({ ...invoiceForm, month: event.target.value })} /></LabeledInput>
                    <LabeledInput label="Rent"><input className="pg-input" type="number" value={invoiceForm.rent} onChange={(event) => setInvoiceForm({ ...invoiceForm, rent: event.target.value })} /></LabeledInput>
                    <LabeledInput label="Charges"><input className="pg-input" type="number" value={invoiceForm.charges} onChange={(event) => setInvoiceForm({ ...invoiceForm, charges: event.target.value })} /></LabeledInput>
                    <LabeledInput label="Tax %"><input className="pg-input" type="number" value={invoiceForm.tax} onChange={(event) => setInvoiceForm({ ...invoiceForm, tax: event.target.value })} /></LabeledInput>
                    <div className="flex items-end"><button className="pg-button-primary w-full" type="submit"><FileText size={18} /> Generate Invoice</button></div>
                </form>
            </Section>
            <ResponsiveSortableTable
                columns={[
                    { key: "invoiceNo", header: "Invoice No", accessor: "invoiceNo" },
                    { key: "studentName", header: "Student", accessor: "studentName" },
                    { key: "room", header: "Room", accessor: "room" },
                    { key: "month", header: "Month", accessor: "month" },
                    { key: "grandTotal", header: "Grand Total", render: (row) => formatCurrency(row.grandTotal) },
                    { key: "actions", header: "PDF", sortable: false, searchable: false, render: (row) => <button className="rounded border p-2 text-emerald-700" type="button" onClick={() => downloadHtml(row.invoiceNo, invoiceHtml(row))} title="Download invoice"><Download size={16} /></button> },
                ]}
                rows={invoices}
                rowKey={(row) => row.id}
            />
        </div>
    );

    const renderReceipts = () => (
        <Section title="Receipt Generation">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
                <select className="pg-input" value={receiptForm.paymentId} onChange={(event) => setReceiptForm({ ...receiptForm, paymentId: event.target.value })}>{payments.map((payment) => <option key={payment.id} value={payment.id}>{payment.receiptNo || payment.receiptNumber || payment.id} - {payment.studentName}</option>)}</select>
                <input className="pg-input" placeholder="Signature" value={receiptForm.signature} onChange={(event) => setReceiptForm({ ...receiptForm, signature: event.target.value })} />
                <button className="pg-button-primary" type="button" disabled={!receiptPayment} onClick={() => receiptPayment && downloadHtml(`Receipt-${receiptPayment.receiptNo || receiptPayment.id}`, receiptHtml(receiptPayment))}><Download size={18} /> PDF</button>
                <button className="rounded-lg border px-4 py-2 text-sm font-bold" type="button" disabled={!receiptPayment} onClick={() => receiptPayment && printHtml(`Receipt-${receiptPayment.receiptNo || receiptPayment.id}`, receiptHtml(receiptPayment))}><Printer size={18} /> Print</button>
            </div>
            {receiptPayment && <div className="mt-4 rounded-lg border p-4 text-sm"><p><strong>Receipt No:</strong> {receiptPayment.receiptNo || receiptPayment.receiptNumber || receiptPayment.id}</p><p><strong>Date:</strong> {getPaymentDate(receiptPayment)}</p><p><strong>Student:</strong> {receiptPayment.studentName}</p><p><strong>Amount:</strong> {formatCurrency(getPaymentAmount(receiptPayment))}</p><p><strong>Mode:</strong> {receiptPayment.paymentMode || receiptPayment.method || "-"}</p><p><strong>QR Code:</strong> Ready for receipt print</p></div>}
        </Section>
    );

    const renderOnlinePayment = () => (
        <div className="space-y-5">
            <Section title="Online Payment">
                <form className="space-y-4" onSubmit={saveOnlinePayment}>
                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-lg border p-4">
                            <p className="mb-3 text-sm font-black text-slate-700">Payer and payment method</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <LabeledInput label="Student / Person">
                                    <select
                                        className="pg-input"
                                        value={onlineForm.studentEntryMode === "manual" ? "__manual__" : onlineForm.studentKey}
                                        onChange={(event) => {
                                            if (event.target.value === "__manual__") {
                                                setOnlineForm({ ...onlineForm, studentEntryMode: "manual", studentKey: "" });
                                                return;
                                            }
                                            const student = selectedStudentOption(event.target.value);
                                            const dueAmount = roundAmount(
                                                pendingRows
                                                    .filter((payment) => String(payment.studentId) === String(student.studentId))
                                                    .reduce((total, payment) => total + toAmount(payment.amountDue), 0),
                                            );
                                            setOnlineForm({ ...onlineForm, studentEntryMode: "registered", studentKey: event.target.value, manualName: "", amount: dueAmount || "" });
                                        }}
                                    >
                                        <option value="">Select registered student / person</option>
                                        {studentOptions.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}{student.room ? ` - Room ${student.room}` : ""}
                                            </option>
                                        ))}
                                        <option value="__manual__">Add manually...</option>
                                    </select>
                                </LabeledInput>
                                <LabeledInput label="Status">
                                    <select className="pg-input" value={onlineForm.status} onChange={(event) => setOnlineForm({ ...onlineForm, status: event.target.value })}><option>Created</option><option>Paid</option><option>Failed</option><option>Refunded</option></select>
                                </LabeledInput>
                                {onlineForm.studentEntryMode === "manual" && (
                                    <LabeledInput label="Manual Name">
                                        <input
                                            className="pg-input"
                                            placeholder="Manual name"
                                            value={onlineForm.manualName}
                                            onChange={(event) => setOnlineForm({ ...onlineForm, manualName: event.target.value })}
                                        />
                                    </LabeledInput>
                                )}
                                <LabeledInput label="Amount">
                                    <input className="pg-input" type="number" step="1" placeholder="Amount" value={onlineForm.amount} onChange={(event) => setOnlineForm({ ...onlineForm, amount: event.target.value ? roundAmount(event.target.value) : "" })} />
                                </LabeledInput>
                            </div>
                            {onlineForm.studentEntryMode !== "manual" && onlineForm.studentKey && (
                                <div className="mt-4 grid gap-2 md:grid-cols-4">
                                    {onlineAllocationItems.map((item) => (
                                        <div className={`rounded-lg border p-3 text-sm ${item.value ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`} key={item.label}>
                                            <p className="text-xs font-black uppercase">{item.label}</p>
                                            <p className="font-bold">{item.value ? `Allocated ${item.label}: ${item.value}` : `${item.label} not allocated`}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border bg-emerald-50 p-4">
                            <p className="text-sm font-black text-emerald-700">Payment Link / Entry</p>
                            <p className="mt-2 text-3xl font-black text-emerald-700">{formatCurrency(onlineForm.amount)}</p>
                            <p className="mt-1 text-xs text-slate-500">{onlineForm.provider === "Cash" ? "Cash entry will be logged." : "Gateway link can be generated from this amount."}</p>
                            {selectedOnlineDueAmount > 0 && <p className="mt-1 text-xs font-bold text-emerald-700">Pending due: {formatCurrency(selectedOnlineDueAmount)} from {selectedOnlineDues.length} record(s)</p>}
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white" type="button" onClick={() => setOnlineForm({ ...onlineForm, amount: selectedOnlineDueAmount || roundAmount(onlineForm.amount) })}>Use Due</button>
                                <button className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-700" type="button" onClick={() => setOnlineForm({ ...onlineForm, amount: "" })}>Manual Amount</button>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="mb-3 text-sm font-black text-slate-700">Payment option</p>
                        <PaymentModeChips modes={onlineProviders} value={onlineForm.provider} onChange={(provider) => setOnlineForm({ ...onlineForm, provider })} />
                    </div>
                    <button className="pg-button-success w-full justify-center" type="submit"><CreditCard size={18} /> {onlineForm.provider === "Cash" ? "Record Cash Payment" : "Pay Now"}</button>
                </form>
                <p className="mt-3 text-xs text-slate-500">
                    Manual names are confirmed before being added to Student / Person Profiles, so the same person becomes selectable across payments, reminders, invoices, and other modules.
                </p>
            </Section>
            <ResponsiveSortableTable columns={[{ key: "provider", header: "Gateway", accessor: "provider" }, { key: "student", header: "Student", accessor: "student" }, { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) }, { key: "status", header: "Transaction Status", accessor: "status" }, { key: "date", header: "Date", accessor: "date" }]} rows={onlinePayments} rowKey={(row) => row.id} />
        </div>
    );

    const renderHistory = () => (
        <Section title="Payment History">
            <div className="mb-4 grid gap-3 md:grid-cols-6">
                <input className="pg-input" placeholder="Search student, room, receipt..." value={historyFilters.query} onChange={(event) => setHistoryFilters({ ...historyFilters, query: event.target.value })} />
                <select className="pg-input" value={historyFilters.range} onChange={(event) => setHistoryFilters({ ...historyFilters, range: event.target.value })}>{["Today", "Weekly", "Monthly", "Yearly", "Custom Date", "All"].map((range) => <option key={range}>{range}</option>)}</select>
                <select className="pg-input" value={historyFilters.status} onChange={(event) => setHistoryFilters({ ...historyFilters, status: event.target.value })}><option>All</option>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                <input className="pg-input" type="date" value={historyFilters.from} onChange={(event) => setHistoryFilters({ ...historyFilters, from: event.target.value })} />
                <input className="pg-input" type="date" value={historyFilters.to} onChange={(event) => setHistoryFilters({ ...historyFilters, to: event.target.value })} />
                <button className="rounded-lg border px-3 py-2 text-sm font-bold" type="button" onClick={() => showInfoPopup("Payment History", `${filteredHistory.length} payment records found.`)}>Summary</button>
            </div>
            <ResponsiveSortableTable columns={[{ key: "studentName", header: "Student", accessor: "studentName" }, { key: "roomNumber", header: "Room", accessor: "roomNumber" }, { key: "date", header: "Date", sortValue: getPaymentDate, render: getPaymentDate }, { key: "receipt", header: "Receipt", render: (row) => row.receiptNo || row.receiptNumber || row.id }, { key: "amount", header: "Amount", render: (row) => formatCurrency(getPaymentAmount(row)) }, { key: "status", header: "Status", render: (row) => row.status || row.paymentStatus || "-" }]} rows={filteredHistory} rowKey={(row) => row.id} />
        </Section>
    );

    const renderPaymentsWorkspace = () => (
        <div className="space-y-5">
            <Section title="Payments">
                <div className="grid gap-4 lg:grid-cols-4">
                    <StatCard label="Selected Person" value={selectedStudentPayment.name || "Select"} note={selectedStudentPayment.room ? `Room ${selectedStudentPayment.room}` : "Registered or manual payer"} tone="blue" />
                    <StatCard label="Prepared Bill" value={formatCurrency(studentPaymentTotals.grandTotal)} note="Student payment calculation" tone="emerald" />
                    <StatCard label="Collection Due" value={formatCurrency(collectionTotals.grandTotal || existingCollectionDue?.amountDue || 0)} note="Use due or manual amount" tone="amber" />
                    <StatCard label="Pending Dues" value={formatCurrency(pendingAmount)} note={`${pendingRows.length} pending record(s)`} tone="red" />
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    Use this page from top to bottom: prepare a bill, collect the amount by cash/UPI/card/gateway, or send/record an online payment. Pending dues stay visible below so the amount is not missed.
                </div>
            </Section>
            {renderStudentPayment()}
            {renderCollection()}
            {renderOnlinePayment()}
            {renderPending()}
        </div>
    );

    const renderExpenses = () => (
        <div className="space-y-5">
            <Section title="Expense Management">
                <form className="grid gap-4 md:grid-cols-6" onSubmit={addExpense}>
                    <select className="pg-input" value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select>
                    <input className="pg-input" type="number" placeholder="Amount" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
                    <input className="pg-input" placeholder="Vendor" value={expenseForm.vendor} onChange={(event) => setExpenseForm({ ...expenseForm, vendor: event.target.value })} />
                    <input className="pg-input" type="date" value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} />
                    <input className="pg-input" placeholder="Approved By" value={expenseForm.approvedBy} onChange={(event) => setExpenseForm({ ...expenseForm, approvedBy: event.target.value })} />
                    <button className="pg-button-danger" type="submit"><Plus size={18} /> Add Expense</button>
                </form>
            </Section>
            <ResponsiveSortableTable columns={[{ key: "expenseNo", header: "Expense No", accessor: "expenseNo" }, { key: "category", header: "Category", accessor: "category" }, { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) }, { key: "vendor", header: "Vendor", accessor: "vendor" }, { key: "date", header: "Date", accessor: "date" }, { key: "approvedBy", header: "Approved By", accessor: "approvedBy" }]} rows={expenses} rowKey={(row) => row.id} />
        </div>
    );

    const renderReports = () => (
        <div className="space-y-5">
            <Section title="Income Reports">
                <div className="grid gap-3 md:grid-cols-4">{reportTypes.map((type) => <button key={type} className="rounded-lg border bg-white px-3 py-3 text-left text-sm font-bold hover:bg-slate-50" type="button" onClick={() => showInfoPopup(type, `${type} total: ${formatCurrency(totalIncome)}`)}>{type}</button>)}</div>
            </Section>
            <Section title="Charts">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-3"><p className="font-black">Bar Chart</p>{monthlyChartRows.map((item) => <MiniBar key={item.label} label={item.label} value={item.value} max={maxMonthlyValue} />)}</div>
                    <div className="space-y-3"><p className="font-black">Pie Chart</p>{methodTotals.map((item) => <MiniBar key={item.label} label={item.label} value={item.value} max={reportMax} />)}</div>
                    <div className="space-y-3"><p className="font-black">Line Chart</p>{monthlyChartRows.map((item) => <MiniBar key={item.label} label={item.label} value={item.value} max={maxMonthlyValue} />)}</div>
                </div>
            </Section>
        </div>
    );

    const renderFinancialDashboard = () => (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Income" value={formatCurrency(totalIncome)} tone="emerald" />
            <StatCard label="Total Expenses" value={formatCurrency(totalExpenses)} tone="red" />
            <StatCard label="Net Profit" value={formatCurrency(totalIncome - totalExpenses)} tone="violet" />
            <StatCard label="Collection Rate" value={`${collectionRate}%`} tone="blue" />
            <StatCard label="Pending Collection" value={formatCurrency(pendingAmount)} tone="amber" />
            <StatCard label="Refund Amount" value={formatCurrency(refundTotal)} tone="amber" />
            <StatCard label="Security Deposit" value={formatCurrency(depositTotal)} tone="blue" />
            <StatCard label="Average Monthly Income" value={formatCurrency(totalIncome / Math.max(1, new Set(payments.map((payment) => getPaymentDate(payment).slice(0, 7))).size))} tone="emerald" />
        </div>
    );

    const pageRenderers = {
        dashboard: renderDashboard,
        "fee-structure": renderFeeStructure,
        payments: renderPaymentsWorkspace,
        "student-payment": renderPaymentsWorkspace,
        collection: renderPaymentsWorkspace,
        pending: renderPaymentsWorkspace,
        reminders: renderReminders,
        "security-deposit": renderSecurityDeposit,
        refunds: renderRefunds,
        discounts: renderDiscounts,
        penalty: renderPenalty,
        invoices: renderInvoices,
        receipts: renderReceipts,
        "online-payment": renderPaymentsWorkspace,
        history: renderHistory,
        expenses: renderExpenses,
        reports: renderReports,
        "financial-dashboard": renderFinancialDashboard,
    };

    const ActiveIcon = incomePages.find((page) => page.key === activePage)?.icon || WalletCards;

    return (
        <AdminLayout>
            <div className="space-y-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black text-emerald-700"><ActiveIcon size={24} /> Income / Payments</h1>
                        <p className="text-sm text-slate-500">Students, rooms, staff collection, payments, deposits, refunds, expenses, and reports in one income workspace.</p>
                    </div>
                    <Link className="pg-button-success" to={pgPath("/payment-operations/payments")}><Plus size={18} /> Record Payment</Link>
                </div>

                {pageRenderers[activePage]()}
            </div>
        </AdminLayout>
    );
};

export default PaymentOperations;
