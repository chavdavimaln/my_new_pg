import React, { useEffect, useMemo, useState } from "react";
import { Download, Eye, Mail, MessageCircle, Pencil, Save, Trash2, X } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { adminRoles, getCurrentAdmin, isSuperAdmin } from "../../Utils/adminAuth";
import { getStoredAllocations, getStoredStudents } from "../../Utils/allocationHelper";
import {
    calculateAllocationCharges,
    formatCurrency,
    getPaymentSettings,
    getPaymentStatus,
    getStoredPayments,
    savePaymentSettings,
    saveStoredPayments,
    toAmount,
} from "../../Utils/paymentHelper";

const paymentModes = ["Cash", "UPI", "Bank Transfer", "Card"];
const paymentStatuses = ["Paid", "Pending", "Partial", "Deposit", "Late Fee", "Extra", "Overdue", "Cancelled", "Refunded"];
const paymentTypes = ["Rent", "Partial", "Deposit", "Late Fee", "Extra", "Refund"];

const emptyPayment = {
    allocationId: "",
    dueDate: "",
    paidDate: new Date().toISOString().slice(0, 10),
    paymentMode: "Cash",
    paymentType: "Rent",
    status: "Pending",
    partialAmount: "",
    checkIn: "",
    checkOut: "",
    notes: "",
};

const fieldClass = "w-full rounded-lg border p-3";
const hiddenQuantityChargeKeys = ["roomCharge", "bedCharge", "tableCharge", "cupboardCharge"];

const shouldShowQuantity = (item) => !item.hideQuantity && !hiddenQuantityChargeKeys.includes(item.key);

const getRentBasedCharges = (monthlyRent) => {
    const rent = toAmount(monthlyRent);

    return {
        maintenanceFee: rent * 0.1,
        roomCharge: rent * 0.5,
        bedCharge: rent * 0.2,
        tableCharge: rent * 0.1,
        cupboardCharge: rent * 0.1,
    };
};

const buildReceiptHtml = (receipt) => `
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${receipt.receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
        h1, h2, p { margin: 0; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px; }
        .muted { color: #4b5563; font-size: 13px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-bottom: 20px; }
        .box { border: 1px solid #d1d5db; padding: 12px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
        th { background: #f3f4f6; }
        .total { font-size: 20px; font-weight: 700; text-align: right; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${receipt.pgName}</h1>
        <p class="muted">${receipt.address}</p>
        <p class="muted">Receipt: ${receipt.receiptNumber} | Date: ${receipt.date} | Time: ${receipt.time}</p>
    </div>
    <div class="grid">
        <div class="box">
            <h2>Student / Person</h2>
            <p>${receipt.studentName}</p>
            <p>Phone: ${receipt.phone}</p>
            <p>Email: ${receipt.email}</p>
            <p>ID: ${receipt.idProof}</p>
        </div>
        <div class="box">
            <h2>Allotment</h2>
            <p>Room: ${receipt.roomNumber}</p>
            <p>Bed: ${receipt.bedLabel}</p>
            <p>Table: ${receipt.tableLabel}</p>
            <p>Cupboard: ${receipt.cupboardLabel}</p>
            <p>Check In: ${receipt.checkIn || "-"}</p>
            <p>Check Out: ${receipt.checkOut || "-"}</p>
        </div>
    </div>
    <table>
        <thead><tr><th>Charge</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>
            ${receipt.items
                .map(
                    (item) =>
                        `<tr><td>${item.label}</td><td>${shouldShowQuantity(item) ? item.quantity : "-"}</td><td>${formatCurrency(
                            item.rate,
                        )}</td><td>${formatCurrency(item.amount)}</td></tr>`,
                )
                .join("")}
        </tbody>
    </table>
    <p class="total">Subtotal: ${formatCurrency(receipt.subtotal)}</p>
    <p class="total">GST (${receipt.gstPercent}%): ${formatCurrency(receipt.gstAmount)}</p>
    <p class="total">Total Amount: ${formatCurrency(receipt.total)}</p>
    <p>GST Number: ${receipt.gstNumber || "-"}</p>
    <p>Payment Mode: ${receipt.paymentMode}</p>
    <p>Status: ${receipt.status}</p>
    <p>Notes: ${receipt.notes || "-"}</p>
</body>
</html>`;

const PaymentManagement = () => {
    const currentAdmin = getCurrentAdmin();
    const canManageModule = isSuperAdmin(currentAdmin) || currentAdmin?.role === adminRoles.SINGLE;
    const [settings, setSettings] = useState(getPaymentSettings());
    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);
    const [payments, setPayments] = useState([]);
    const [formData, setFormData] = useState(emptyPayment);
    const [receiptDraft, setReceiptDraft] = useState(null);
    const [viewReceipt, setViewReceipt] = useState(null);
    const [editingPaymentId, setEditingPaymentId] = useState("");

    useEffect(() => {
        setAllocations(getStoredAllocations());
        setStudents(getStoredStudents());
        setPayments(getStoredPayments());
    }, []);

    const selectedAllocation = useMemo(
        () => allocations.find((allocation) => String(allocation.id) === String(formData.allocationId)) || null,
        [allocations, formData.allocationId],
    );

    const calculatedCharges = useMemo(() => {
        const charges = calculateAllocationCharges(selectedAllocation, settings.feeStructure);
        if (formData.paymentType === "Partial" && toAmount(formData.partialAmount) > 0) {
            const amount = toAmount(formData.partialAmount);
            return { ...charges, subtotal: amount, gstAmount: 0, total: amount, lineItems: [{ key: "partialAmount", label: "Partial Payment", quantity: 1, rate: amount, amount, fixedQuantity: true }] };
        }
        if (formData.paymentType === "Deposit") {
            const item = charges.lineItems.find((line) => line.key === "securityDeposit");
            const amount = Math.abs(toAmount(item?.amount));
            return { ...charges, subtotal: amount, gstAmount: 0, total: amount, lineItems: [{ ...(item || {}), label: "Security Deposit", quantity: 1, rate: amount, amount }] };
        }
        if (formData.paymentType === "Late Fee") {
            const quantity = Math.max(1, toAmount(settings.feeStructure.lateFeeQty));
            const amount = toAmount(settings.feeStructure.lateFee) * quantity;
            return { ...charges, subtotal: amount, gstAmount: 0, total: amount, lineItems: [{ key: "lateFee", label: "Late Fee", quantity, rate: toAmount(settings.feeStructure.lateFee), amount, editableQuantity: true }] };
        }
        if (formData.paymentType === "Extra") {
            const quantity = Math.max(1, toAmount(settings.feeStructure.extraChargesQty));
            const amount = toAmount(settings.feeStructure.extraCharges) * quantity;
            return { ...charges, subtotal: amount, gstAmount: 0, total: amount, lineItems: [{ key: "extraCharges", label: "Extra Charges", quantity, rate: toAmount(settings.feeStructure.extraCharges), amount, editableQuantity: true }] };
        }
        return charges;
    }, [formData.partialAmount, formData.paymentType, selectedAllocation, settings.feeStructure]);

    const updateFee = (field, value) => {
        const feeStructure = {
            ...settings.feeStructure,
            [field]: value,
            ...(field === "monthlyRent" ? getRentBasedCharges(value) : {}),
        };
        const updatedSettings = { ...settings, feeStructure };
        setSettings(updatedSettings);
        savePaymentSettings(updatedSettings);
    };

    const toggleModule = (enabled) => {
        const updatedSettings = { ...settings, enabled };
        setSettings(updatedSettings);
        savePaymentSettings(updatedSettings);
    };

    const makeReceipt = (payment) => {
        const allocation = allocations.find((item) => String(item.id) === String(payment.allocationId));
        const student = students.find((item) => String(item.id) === String(allocation?.studentId));
        const charges = payment.charges || calculateAllocationCharges(allocation, settings.feeStructure);
        const createdAt = payment.createdAt ? new Date(payment.createdAt) : new Date();

        return {
            receiptNumber: payment.receiptNumber || `RCPT-${payment.id}`,
            pgName: settings.feeStructure.pgName || "PG Admin",
            address: settings.feeStructure.address || "-",
            date: createdAt.toLocaleDateString(),
            time: createdAt.toLocaleTimeString(),
            studentName: allocation?.studentName || student?.name || "-",
            phone: allocation?.phone || student?.phone || "-",
            email: allocation?.email || student?.email || "-",
            idProof: student?.idProof || student?.idProofNumber || "-",
            roomNumber: allocation?.roomNumber || "-",
            bedLabel: allocation?.bedLabel || allocation?.bedId || "-",
            tableLabel: allocation?.tableLabel || allocation?.tableId || "-",
            cupboardLabel: allocation?.cupboardLabel || allocation?.cupboardId || "-",
            checkIn: payment.checkIn || student?.joiningDate || "",
            checkOut: payment.checkOut || "",
            paymentMode: payment.paymentMode || "-",
            status: getPaymentStatus(payment),
            notes: payment.notes || "",
            subtotal: charges.subtotal,
            gstPercent: charges.gstPercent,
            gstAmount: charges.gstAmount,
            gstNumber: charges.gstNumber,
            total: charges.total,
            items: (charges.lineItems || []).filter((item) => toAmount(item.amount) !== 0),
        };
    };

    const savePayment = () => {
        if (!selectedAllocation) {
            alert("Please select an allocated student");
            return;
        }

        const payment = {
            id: editingPaymentId || Date.now(),
            receiptNumber: editingPaymentId ? payments.find((item) => item.id === editingPaymentId)?.receiptNumber : `RCPT-${Date.now()}`,
            ...formData,
            allocationId: selectedAllocation.id,
            studentName: selectedAllocation.studentName,
            roomNumber: selectedAllocation.roomNumber,
            charges: calculatedCharges,
            amount: calculatedCharges.total,
            createdAt: new Date().toISOString(),
        };

        const updatedPayments = editingPaymentId
            ? payments.map((item) => (item.id === editingPaymentId ? { ...item, ...payment, updatedAt: new Date().toISOString() } : item))
            : [...payments, payment];
        saveStoredPayments(updatedPayments);
        setPayments(updatedPayments);
        setFormData(emptyPayment);
        setEditingPaymentId("");
        setReceiptDraft(makeReceipt(payment));
    };

    const editPayment = (payment) => {
        setEditingPaymentId(payment.id);
        setFormData({ ...emptyPayment, ...payment, partialAmount: payment.partialAmount || "" });
    };

    const updatePaymentStatus = (paymentId, status) => {
        const updatedPayments = payments.map((payment) => (payment.id === paymentId ? { ...payment, status, updatedAt: new Date().toISOString() } : payment));
        saveStoredPayments(updatedPayments);
        setPayments(updatedPayments);
    };

    const deletePayment = (paymentId) => {
        if (!window.confirm("Delete this payment record?")) return;
        const updatedPayments = payments.filter((payment) => payment.id !== paymentId);
        saveStoredPayments(updatedPayments);
        setPayments(updatedPayments);
    };

    const downloadReceipt = (receipt) => {
        if (!window.confirm("Download this receipt with the current details?")) return;

        const blob = new Blob([buildReceiptHtml(receipt)], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${receipt.receiptNumber}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const sendMail = (receipt) => {
        const subject = encodeURIComponent(`Payment Receipt ${receipt.receiptNumber}`);
        const body = encodeURIComponent(
            `Hello ${receipt.studentName},\n\nYour payment receipt ${receipt.receiptNumber} for ${formatCurrency(
                receipt.total,
            )} is ready.\n\nSubtotal: ${formatCurrency(receipt.subtotal)}\nGST: ${formatCurrency(
                receipt.gstAmount,
            )}\nPayment Mode: ${receipt.paymentMode}\nStatus: ${receipt.status}\n\n${receipt.pgName}`,
        );
        window.location.href = `mailto:${receipt.email}?subject=${subject}&body=${body}`;
    };

    const sendWhatsApp = (receipt) => {
        const phone = String(receipt.phone || "").replace(/\D/g, "");
        const text = encodeURIComponent(
            `${receipt.pgName} receipt ${receipt.receiptNumber}: ${formatCurrency(receipt.total)} paid by ${
                receipt.paymentMode
            }. Status: ${receipt.status}.`,
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
    };

    const columns = [
        { key: "receiptNumber", header: "Receipt", accessor: "receiptNumber" },
        { key: "studentName", header: "Student", accessor: "studentName" },
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        { key: "amount", header: "Total", sortValue: (item) => item.amount, render: (item) => formatCurrency(item.amount) },
        { key: "paymentMode", header: "Mode", accessor: "paymentMode" },
        { key: "paymentType", header: "Type", accessor: "paymentType" },
        {
            key: "status",
            header: "Status",
            sortValue: (item) => getPaymentStatus(item),
            render: (item) => (
                <select value={item.status} onChange={(event) => updatePaymentStatus(item.id, event.target.value)} className="rounded border p-2">
                    {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
            ),
        },
        {
            key: "action",
            header: "Receipt",
            sortable: false,
            searchable: false,
            render: (payment) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => editPayment(payment)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-amber-600 text-white"
                        title="Edit payment"
                        aria-label="Edit payment"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => deletePayment(payment.id)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-red-600 text-white"
                        title="Delete payment"
                        aria-label="Delete payment"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewReceipt(makeReceipt(payment))}
                        className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                        title="View receipt"
                        aria-label="View receipt"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setReceiptDraft(makeReceipt(payment))}
                        className="flex h-9 w-9 items-center justify-center rounded bg-green-600 text-white"
                        title="Edit and download receipt"
                        aria-label="Edit and download receipt"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const receipt = receiptDraft || viewReceipt;
    const readOnlyReceipt = Boolean(viewReceipt);
    const recalculateReceipt = (nextReceipt) => {
        const subtotal = (nextReceipt.items || []).reduce((total, item) => total + toAmount(item.amount), 0);
        const gstAmount = (subtotal * toAmount(nextReceipt.gstPercent)) / 100;

        return {
            ...nextReceipt,
            subtotal,
            gstAmount,
            total: subtotal + gstAmount,
        };
    };
    const updateReceiptField = (field, value) => {
        const nextReceipt = { ...receipt, [field]: value };
        setReceiptDraft(field === "gstPercent" ? recalculateReceipt(nextReceipt) : nextReceipt);
    };
    const updateReceiptItem = (index, field, value) => {
        const items = receipt.items.map((item, itemIndex) => {
            if (itemIndex !== index) return item;

            const nextItem = { ...item, [field]: value };
            const quantity = field === "quantity" ? toAmount(value) : toAmount(nextItem.quantity);
            const rate = field === "rate" ? toAmount(value) : toAmount(nextItem.rate);

            return {
                ...nextItem,
                amount: quantity * rate * (nextItem.deduction ? -1 : 1),
            };
        });

        setReceiptDraft(recalculateReceipt({ ...receipt, items }));
    };

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold">Payment Management</h1>
                    {canManageModule && (
                        <label className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(event) => toggleModule(event.target.checked)}
                            />
                            <span>Payment module enabled</span>
                        </label>
                    )}
                </div>

                {!settings.enabled && !canManageModule ? (
                    <div className="rounded-lg bg-white p-6 shadow">Payment module is disabled by admin.</div>
                ) : (
                    <>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-bold">Fee Structure</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-medium">Hotel / PG Name</label>
                                    <input
                                        value={settings.feeStructure.pgName}
                                        onChange={(event) => updateFee("pgName", event.target.value)}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">Address</label>
                                    <input
                                        value={settings.feeStructure.address}
                                        onChange={(event) => updateFee("address", event.target.value)}
                                        className={fieldClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-medium">GST Number</label>
                                    <input
                                        value={settings.feeStructure.gstNumber}
                                        onChange={(event) => updateFee("gstNumber", event.target.value)}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">GST %</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={settings.feeStructure.gstPercent}
                                        onChange={(event) => updateFee("gstPercent", event.target.value)}
                                        className={fieldClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-bold">Payment Collection</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-medium">Allocated Student</label>
                                    <select
                                        value={formData.allocationId}
                                        onChange={(event) =>
                                            setFormData({ ...formData, allocationId: event.target.value })
                                        }
                                        className={fieldClass}
                                    >
                                        <option value="">Select Allocation</option>
                                        {allocations.map((allocation) => (
                                            <option key={allocation.id} value={allocation.id}>
                                                {allocation.studentName} - Room {allocation.roomNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">Check In</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.checkIn}
                                        onChange={(event) => setFormData({ ...formData, checkIn: event.target.value })}
                                        className={fieldClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">Check Out</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.checkOut}
                                        onChange={(event) => setFormData({ ...formData, checkOut: event.target.value })}
                                        className={fieldClass}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-2 block font-medium">Any Other Information</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                                        className={fieldClass}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border p-2 text-left">Amount List</th>
                                                <th className="border p-2 text-left">Qty</th>
                                                <th className="border p-2 text-right">Rate / Charges</th>
                                                <th className="border p-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calculatedCharges.lineItems.map((item) => (
                                                <tr key={item.key}>
                                                    <td className="border p-2 font-medium">{item.label}</td>
                                                    <td className="border p-2">
                                                        {!shouldShowQuantity(item) ? (
                                                            <span className="text-gray-400">-</span>
                                                        ) : item.editableQuantity ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={settings.feeStructure[item.qtyKey]}
                                                                onChange={(event) =>
                                                                    updateFee(item.qtyKey, event.target.value)
                                                                }
                                                                className="w-24 rounded-lg border p-2"
                                                                aria-label={`${item.label} quantity`}
                                                            />
                                                        ) : item.automaticQuantity ? (
                                                            <span>{item.quantity}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="border p-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={settings.feeStructure[item.key]}
                                                            onChange={(event) => updateFee(item.key, event.target.value)}
                                                            className="ml-auto block w-40 rounded-lg border p-2 text-right"
                                                            aria-label={`${item.label} rate`}
                                                        />
                                                    </td>
                                                    <td className="border p-2 text-right font-medium">
                                                        {formatCurrency(item.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td className="border p-2 text-right font-medium" colSpan="3">
                                                    Subtotal
                                                </td>
                                                <td className="border p-2 text-right font-medium">
                                                    {formatCurrency(calculatedCharges.subtotal)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 text-right font-medium" colSpan="3">
                                                    GST ({calculatedCharges.gstPercent}%)
                                                </td>
                                                <td className="border p-2 text-right font-medium">
                                                    {formatCurrency(calculatedCharges.gstAmount)}
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-100">
                                                <td className="border p-2 text-right text-lg font-bold" colSpan="3">
                                                    Total Amount To Be Paid
                                                </td>
                                                <td className="border p-2 text-right text-lg font-bold">
                                                    {formatCurrency(calculatedCharges.total)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block font-medium">Payment Type</label>
                                    <select
                                        value={formData.paymentType}
                                        onChange={(event) =>
                                            setFormData({
                                                ...formData,
                                                paymentType: event.target.value,
                                                status: event.target.value === "Partial" ? "Partial" : event.target.value === "Deposit" ? "Deposit" : event.target.value === "Late Fee" ? "Late Fee" : event.target.value === "Extra" ? "Extra" : formData.status,
                                            })
                                        }
                                        className={fieldClass}
                                    >
                                        {paymentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                {formData.paymentType === "Partial" && (
                                    <div>
                                        <label className="mb-2 block font-medium">Partial Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.partialAmount}
                                            onChange={(event) => setFormData({ ...formData, partialAmount: event.target.value })}
                                            className={fieldClass}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="mb-2 block font-medium">Payment Mode</label>
                                    <select
                                        value={formData.paymentMode}
                                        onChange={(event) =>
                                            setFormData({ ...formData, paymentMode: event.target.value })
                                        }
                                        className={fieldClass}
                                    >
                                        {paymentModes.map((mode) => (
                                            <option key={mode} value={mode}>
                                                {mode}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block font-medium">Payment Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                                        className={fieldClass}
                                    >
                                        {paymentStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={savePayment}
                                className="mt-5 flex h-11 w-11 items-center justify-center rounded-lg bg-green-600 text-white"
                                title="Save payment"
                                aria-label="Save payment"
                            >
                                <Save className="h-5 w-5" />
                            </button>
                            {editingPaymentId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPaymentId("");
                                        setFormData(emptyPayment);
                                    }}
                                    className="ml-3 mt-5 rounded-lg border px-4 py-2.5 font-medium"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-xl font-bold">Payment Status</h2>
                            <ResponsiveSortableTable
                                columns={columns}
                                rows={payments}
                                rowKey={(payment) => payment.id}
                                searchPlaceholder="Search payments..."
                            />
                        </div>
                    </>
                )}

                {receipt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold">Receipt {readOnlyReceipt ? "Preview" : "Editor"}</h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReceiptDraft(null);
                                        setViewReceipt(null);
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded bg-gray-200"
                                    title="Close"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {["pgName", "address", "studentName", "phone", "email", "idProof", "roomNumber", "bedLabel", "tableLabel", "cupboardLabel", "checkIn", "checkOut", "paymentMode", "status", "gstNumber", "gstPercent", "notes"].map((field) => (
                                    <div key={field}>
                                        <label className="mb-2 block font-medium">{field}</label>
                                        <input
                                            value={receipt[field] || ""}
                                            readOnly={readOnlyReceipt}
                                            onChange={(event) => updateReceiptField(field, event.target.value)}
                                            className={`${fieldClass} ${readOnlyReceipt ? "bg-gray-100" : ""}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-lg border p-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2 text-left">Charge</th>
                                                <th className="py-2 text-left">Qty</th>
                                                <th className="py-2 text-right">Rate</th>
                                                <th className="py-2 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receipt.items.map((item, index) => (
                                                <tr key={item.label} className="border-b last:border-b-0">
                                                    <td className="py-2">{item.label}</td>
                                                    <td className="py-2">
                                                        {!shouldShowQuantity(item) ? (
                                                            <span className="text-gray-400">-</span>
                                                        ) : readOnlyReceipt ? (
                                                            item.quantity
                                                        ) : item.editableQuantity ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.quantity}
                                                                onChange={(event) =>
                                                                    updateReceiptItem(index, "quantity", event.target.value)
                                                                }
                                                                className="w-20 rounded border p-2"
                                                            />
                                                        ) : (
                                                            <span>{item.automaticQuantity ? item.quantity : "-"}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        {readOnlyReceipt ? (
                                                            formatCurrency(item.rate)
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.rate}
                                                                onChange={(event) =>
                                                                    updateReceiptItem(index, "rate", event.target.value)
                                                                }
                                                                className="ml-auto block w-28 rounded border p-2 text-right"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 space-y-1 text-right">
                                    <p>Subtotal: {formatCurrency(receipt.subtotal)}</p>
                                    <p>GST ({receipt.gstPercent}%): {formatCurrency(receipt.gstAmount)}</p>
                                    <p className="text-lg font-bold">Total Amount: {formatCurrency(receipt.total)}</p>
                                </div>
                            </div>

                            {!readOnlyReceipt && (
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => downloadReceipt(receipt)}
                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendWhatsApp(receipt)}
                                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendMail(receipt)}
                                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Mail
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default PaymentManagement;
