const PAYMENT_SETTINGS_KEY = "paymentSettings";
const PAYMENTS_KEY = "payments";

const defaultFeeStructure = {
    pgName: "Jay Ambe PG",
    address: "Paying Guest & Library",
    monthlyRent: 0,
    monthlyRentQty: 1,
    securityDeposit: 0,
    securityDepositQty: 1,
    maintenanceFee: 0,
    maintenanceFeeQty: 1,
    electricity: 0,
    electricityQty: 0,
    waterCharges: 0,
    waterChargesQty: 0,
    foodCharges: 0,
    foodChargesQty: 0,
    otherCharges: 0,
    otherChargesQty: 0,
    lateFee: 0,
    lateFeeQty: 0,
    extraCharges: 0,
    extraChargesQty: 0,
    roomCharge: 0,
    roomChargeQty: 1,
    bedCharge: 0,
    bedChargeQty: 1,
    tableCharge: 0,
    tableChargeQty: 1,
    cupboardCharge: 0,
    cupboardChargeQty: 1,
    gstPercent: 0,
    gstNumber: "",
};

const defaultSettings = {
    enabled: true,
    feeStructure: defaultFeeStructure,
};

const parseStoredObject = (key, fallback) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
};

const parseStoredArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

export const getPaymentSettings = () => {
    const settings = parseStoredObject(PAYMENT_SETTINGS_KEY, defaultSettings);

    return {
        ...defaultSettings,
        ...settings,
        feeStructure: {
            ...defaultFeeStructure,
            ...(settings.feeStructure || {}),
        },
    };
};

export const savePaymentSettings = (settings) => {
    localStorage.setItem(
        PAYMENT_SETTINGS_KEY,
        JSON.stringify({
            ...getPaymentSettings(),
            ...settings,
            feeStructure: {
                ...getPaymentSettings().feeStructure,
                ...(settings.feeStructure || {}),
            },
        }),
    );
};

export const isPaymentModuleEnabled = () => getPaymentSettings().enabled !== false;

export const getStoredPayments = () => parseStoredArray(PAYMENTS_KEY);

export const saveStoredPayments = (payments) => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments.filter(Boolean)));
};

export const toAmount = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
};

export const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(toAmount(value));

const lineDefinitions = [
    { key: "monthlyRent", qtyKey: "monthlyRentQty", label: "Monthly Rent", editableQuantity: true },
    { key: "securityDeposit", qtyKey: "securityDepositQty", label: "Security Deposit", fixedQuantity: 1, deduction: true },
    { key: "maintenanceFee", qtyKey: "maintenanceFeeQty", label: "Maintenance Fee", fixedQuantity: 1 },
    {
        key: "roomCharge",
        qtyKey: "roomChargeQty",
        label: "Room Allotment Charge",
        allocationType: "room",
        hideQuantity: true,
    },
    {
        key: "bedCharge",
        qtyKey: "bedChargeQty",
        label: "Bed Allotment Charge",
        allocationType: "bed",
        hideQuantity: true,
    },
    {
        key: "tableCharge",
        qtyKey: "tableChargeQty",
        label: "Table Allotment Charge",
        allocationType: "table",
        hideQuantity: true,
    },
    {
        key: "cupboardCharge",
        qtyKey: "cupboardChargeQty",
        label: "Cupboard Allotment Charge",
        allocationType: "cupboard",
        hideQuantity: true,
    },
    { key: "electricity", qtyKey: "electricityQty", label: "Electricity", fixedQuantity: 1 },
    { key: "waterCharges", qtyKey: "waterChargesQty", label: "Water Charges", editableQuantity: true },
    { key: "foodCharges", qtyKey: "foodChargesQty", label: "Food Charges", editableQuantity: true },
    { key: "otherCharges", qtyKey: "otherChargesQty", label: "Other Charges", fixedQuantity: 1 },
    { key: "lateFee", qtyKey: "lateFeeQty", label: "Late Fee", editableQuantity: true },
    { key: "extraCharges", qtyKey: "extraChargesQty", label: "Extra Charges", editableQuantity: true },
];

const getAppliedQuantity = (definition, allocation, fees) => {
    const configuredQty = toAmount(fees[definition.qtyKey]);

    if (definition.fixedQuantity) return definition.fixedQuantity;
    if (definition.hideQuantity) return allocation ? 1 : 0;
    if (definition.allocationType === "room") return allocation ? configuredQty : 0;
    if (definition.allocationType === "bed") return allocation?.bedId ? configuredQty : 0;
    if (definition.allocationType === "table") return allocation?.tableId ? configuredQty : 0;
    if (definition.allocationType === "cupboard") return allocation?.cupboardId ? configuredQty : 0;

    return configuredQty;
};

export const calculateAllocationCharges = (allocation, feeStructure) => {
    const fees = {
        ...defaultFeeStructure,
        ...(feeStructure || {}),
    };

    const lineItems = lineDefinitions.map((definition) => {
        const quantity = getAppliedQuantity(definition, allocation, fees);
        const rate = toAmount(fees[definition.key]);

        return {
            key: definition.key,
            qtyKey: definition.qtyKey,
            label: definition.label,
            quantity,
            rate,
            amount: quantity * rate * (definition.deduction ? -1 : 1),
            editableQuantity: Boolean(definition.editableQuantity),
            automaticQuantity: Boolean(definition.allocationType),
            fixedQuantity: Boolean(definition.fixedQuantity),
            hideQuantity: Boolean(definition.hideQuantity),
            deduction: Boolean(definition.deduction),
        };
    });

    const subtotal = lineItems.reduce((total, item) => total + item.amount, 0);
    const gstPercent = toAmount(fees.gstPercent);
    const gstAmount = (subtotal * gstPercent) / 100;

    return {
        lineItems,
        subtotal,
        gstPercent,
        gstAmount,
        gstNumber: fees.gstNumber || "",
        total: subtotal + gstAmount,
    };
};

export const getPaymentStatus = (payment) => {
    if (payment?.status === "Paid") return "Paid";
    if (payment?.dueDate && new Date(payment.dueDate) < new Date(new Date().toDateString())) return "Overdue";
    return payment?.status || "Pending";
};
