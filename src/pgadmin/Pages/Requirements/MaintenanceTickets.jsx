import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    BarChart3,
    Camera,
    CheckCircle2,
    ClipboardList,
    Clock,
    Edit3,
    Eye,
    Filter,
    ListChecks,
    Mail,
    MessageCircle,
    Plus,
    Printer,
    Search,
    Trash2,
    UserCheck,
    Wrench,
} from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, StatCard, StatusBadge, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getStaff, getTickets, saveTickets, todayISO } from "../../Utils/pgRequirementStore";
import { getStoredAllocations, getStoredRooms, getStoredStudents } from "../../Utils/allocationHelper";
import { showConfirmPopup, showErrorPopup, showSuccessPopup } from "../../../utils/popup";

const categories = [
    "Electrical",
    "Plumbing",
    "Furniture",
    "Cleaning",
    "WiFi / Internet",
    "AC / Fan",
    "Bathroom",
    "Kitchen / Mess",
    "Security",
    "Other",
];

const priorities = ["Low", "Medium", "High", "Urgent"];
const statuses = ["Pending", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"];
const ticketPages = [
    { tab: "Dashboard", path: "/tickets", segment: "" },
    { tab: "All Tickets", path: "/tickets/all", segment: "all" },
    { tab: "Create Ticket", path: "/tickets/create", segment: "create" },
    { tab: "Staff Workload", path: "/tickets/staff", segment: "staff" },
    { tab: "Reports", path: "/tickets/reports", segment: "reports" },
];
const flowSteps = ["Create Ticket", "Pending", "Assigned to Staff", "In Progress", "Resolved", "Closed"];

const emptyForm = {
    ticketId: "",
    studentName: "",
    roomNumber: "",
    bedNumber: "",
    tableNumber: "",
    cupboardNumber: "",
    issueLocationType: "Bed",
    issueLocationDetail: "",
    category: "Electrical",
    title: "",
    description: "",
    priority: "Medium",
    photo: "",
    createdDate: todayISO(),
    assignedStaff: "",
    thirdPartyName: "",
    thirdPartyPhone: "",
    thirdPartyReference: "",
    status: "Pending",
    adminNote: "",
    workNote: "",
    resolvedPhoto: "",
};

const statusTone = {
    Pending: "warning",
    Assigned: "primary",
    "In Progress": "warning",
    Resolved: "success",
    Closed: "slate",
    Rejected: "danger",
};

const priorityTone = {
    Low: "slate",
    Medium: "primary",
    High: "warning",
    Urgent: "danger",
};

const normalizeTicket = (ticket, index = 0) => {
    const statusMap = { Open: "Pending", "On Hold": "Assigned" };
    const date = ticket.createdDate || ticket.date || todayISO();
    const id = ticket.id || Date.now() + index;

    return {
        ...emptyForm,
        ...ticket,
        id,
        ticketId: ticket.ticketId || `TKT-${String(id).slice(-6)}`,
        studentName: ticket.studentName || ticket.raisedBy || "",
        roomNumber: ticket.roomNumber || ticket.room || "",
        bedNumber: ticket.bedNumber || "",
        tableNumber: ticket.tableNumber || "",
        cupboardNumber: ticket.cupboardNumber || "",
        issueLocationType: locationTypes.includes(ticket.issueLocationType) ? ticket.issueLocationType : "Bed",
        issueLocationDetail: ticket.issueLocationDetail || ticket.bedNumber || ticket.tableNumber || ticket.cupboardNumber || ticket.roomNumber || "",
        category: categories.includes(ticket.category) ? ticket.category : "Other",
        title: ticket.title || ticket.issueTitle || "",
        description: ticket.description || ticket.details || "",
        priority: priorities.includes(ticket.priority) ? ticket.priority : "Medium",
        status: statusMap[ticket.status] || ticket.status || "Pending",
        createdDate: date,
        createdAt: ticket.createdAt || date,
        assignedStaff: ticket.assignedStaff || "",
        thirdPartyName: ticket.thirdPartyName || "",
        thirdPartyPhone: ticket.thirdPartyPhone || "",
        thirdPartyReference: ticket.thirdPartyReference || "",
        notes: Array.isArray(ticket.notes) ? ticket.notes : [],
    };
};

const readFileAsDataUrl = (file) =>
    new Promise((resolve) => {
        if (!file) {
            resolve("");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
    });

const daysBetween = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(Math.round(diff / 86400000), 0);
};

const reportColumns = ["Ticket ID", "Title", "Student", "Room", "Bed", "Table", "Cupboard", "Location", "Category", "Priority", "Assigned Staff", "Status", "Created Date"];
const locationTypes = ["Bed", "Table", "Cupboard", "Room", "Common Area", "Other"];

const MaintenanceTickets = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState(() => getTickets().map(normalizeTicket));
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const [modalTicketId, setModalTicketId] = useState("");
    const [modalMode, setModalMode] = useState("view");
    const [modalDraft, setModalDraft] = useState(emptyForm);
    const [editingTicket, setEditingTicket] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filters, setFilters] = useState({ status: "All", priority: "All", room: "", query: "" });
    const [reportFilters, setReportFilters] = useState({ staff: "All", date: "", month: "", year: "", student: "", room: "", bed: "", table: "", cupboard: "", status: "All", priority: "All" });
    const [staffDraft, setStaffDraft] = useState({ status: "Assigned", workNote: "" });
    const [adminNote, setAdminNote] = useState("");

    const rooms = getStoredRooms();
    const students = getStoredStudents();
    const allocations = getStoredAllocations();
    const staffMembers = getStaff();
    const staffNames = staffMembers.length ? staffMembers.map((item) => item.name || item.email || item.phone).filter(Boolean) : ["Ramesh", "Amit", "Suresh", "Housekeeping Team"];
    const uniqueValues = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim() !== "").map(String))];
    const roomOptions = uniqueValues([...rooms.map((room) => room.roomNumber || room.name || room.id), ...allocations.map((allocation) => allocation.roomNumber || allocation.roomId)]);
    const bedOptions = uniqueValues([...rooms.flatMap((room) => (room.beds || []).map((bed) => bed.number || bed.name || bed.id)), ...allocations.map((allocation) => allocation.bedNumber || allocation.bedId)]);
    const tableOptions = uniqueValues([...rooms.flatMap((room) => (room.tables || []).map((table) => table.number || table.name || table.id)), ...allocations.map((allocation) => allocation.tableNumber || allocation.tableId)]);
    const cupboardOptions = uniqueValues([...rooms.flatMap((room) => (room.cupboards || []).map((cupboard) => cupboard.number || cupboard.name || cupboard.id)), ...allocations.map((allocation) => allocation.cupboardNumber || allocation.cupboardId)]);
    const assetLabel = (ticket) => `${ticket.issueLocationType || "Location"}: ${ticket.issueLocationDetail || ticket.bedNumber || ticket.tableNumber || ticket.cupboardNumber || "-"}`;
    const assigneeLabel = (ticket) => ticket.assignedStaff === "__other__"
        ? `${ticket.thirdPartyName || "Third party"}${ticket.thirdPartyPhone ? ` (${ticket.thirdPartyPhone})` : ""}`
        : ticket.assignedStaff || "Unassigned";
    const activeSegment = location.pathname.split("/").filter(Boolean).at(-1);
    const activeTab = ticketPages.find((page) => page.segment === activeSegment)?.tab || "Dashboard";
    const setActiveTab = (tab) => {
        const page = ticketPages.find((item) => item.tab === tab) || ticketPages[0];
        navigate(`/pg${page.path}`);
    };

    const saveAllTickets = (nextTickets) => {
        const normalized = nextTickets.map(normalizeTicket);
        setTickets(normalized);
        saveTickets(normalized);
    };

    const selectedTicket = tickets.find((ticket) => String(ticket.id) === String(selectedTicketId)) || tickets[0];
    const modalTicket = tickets.find((ticket) => String(ticket.id) === String(modalTicketId));

    const filteredTickets = useMemo(() => tickets
        .filter((ticket) => filters.status === "All" || ticket.status === filters.status)
        .filter((ticket) => filters.priority === "All" || ticket.priority === filters.priority)
        .filter((ticket) => !filters.room || String(ticket.roomNumber || "").toLowerCase().includes(filters.room.toLowerCase()))
        .filter((ticket) => `${ticket.ticketId} ${ticket.title} ${ticket.studentName} ${ticket.roomNumber} ${ticket.bedNumber} ${ticket.tableNumber} ${ticket.cupboardNumber} ${ticket.issueLocationType} ${ticket.issueLocationDetail} ${ticket.category} ${ticket.priority} ${assigneeLabel(ticket)} ${ticket.status}`.toLowerCase().includes(filters.query.toLowerCase()))
        .sort((a, b) => String(b.createdDate || "").localeCompare(String(a.createdDate || ""))), [tickets, filters]);

    const today = todayISO();
    const resolvedTickets = tickets.filter((ticket) => ["Resolved", "Closed"].includes(ticket.status));
    const avgResolution = resolvedTickets.length
        ? Math.round(resolvedTickets.reduce((total, ticket) => total + daysBetween(ticket.createdDate, ticket.resolvedDate || ticket.closedDate || today), 0) / resolvedTickets.length)
        : 0;
    const workload = staffNames.map((staff) => ({
        staff,
        total: tickets.filter((ticket) => ticket.assignedStaff === staff && !["Closed", "Rejected"].includes(ticket.status)).length,
        urgent: tickets.filter((ticket) => ticket.assignedStaff === staff && ticket.priority === "Urgent" && !["Closed", "Rejected"].includes(ticket.status)).length,
    }));

    const stats = [
        ["Total Tickets", tickets.length, "All service requests", ClipboardList, "info"],
        ["Pending Tickets", tickets.filter((ticket) => ticket.status === "Pending").length, "Awaiting assignment", Clock, "warning"],
        ["In Progress", tickets.filter((ticket) => ticket.status === "In Progress").length, "Being worked on", Wrench, "primary"],
        ["Resolved", tickets.filter((ticket) => ticket.status === "Resolved").length, "Ready to close", CheckCircle2, "success"],
        ["Urgent Tickets", tickets.filter((ticket) => ticket.priority === "Urgent" && !["Closed", "Rejected"].includes(ticket.status)).length, "Needs fast action", AlertTriangle, "danger"],
        ["Today Tickets", tickets.filter((ticket) => ticket.createdDate === today).length, "Created today", Plus, "info"],
        ["Avg Resolution", `${avgResolution}d`, "Resolved/closed tickets", BarChart3, "slate"],
        ["Staff Workload", workload.reduce((total, item) => total + item.total, 0), "Active assignments", UserCheck, "primary"],
    ];

    const updateTicket = (ticketId, patch, note) => {
        const next = tickets.map((ticket) => {
            if (String(ticket.id) !== String(ticketId)) return ticket;
            const nextNotes = note ? [{ id: Date.now(), date: todayISO(), ...note }, ...(ticket.notes || [])] : ticket.notes || [];
            return { ...ticket, ...patch, notes: nextNotes, updatedAt: todayISO() };
        });
        saveAllTickets(next);
    };

    const openTicketModal = (ticket, mode = "view") => {
        setSelectedTicketId(ticket.id);
        setModalTicketId(ticket.id);
        setModalMode(mode);
        setModalDraft({ ...emptyForm, ...ticket });
        setAdminNote(ticket.adminNote || "");
    };

    const closeTicketModal = () => {
        setModalTicketId("");
        setModalMode("view");
        setModalDraft(emptyForm);
        setAdminNote("");
    };

    const saveModalTicket = async () => {
        if (!modalTicket) return;
        if (!modalDraft.studentName || !modalDraft.roomNumber || !modalDraft.issueLocationType || !modalDraft.issueLocationDetail) {
            await showErrorPopup(
                "Ticket Details Required",
                "Student, room, affected location type, and affected location detail are required.",
            );
            return;
        }
        if (modalDraft.assignedStaff === "__other__" && (!modalDraft.thirdPartyName || !modalDraft.thirdPartyPhone)) {
            await showErrorPopup("Third-Party Details Required", "Third-party name and phone number are required.");
            return;
        }
        updateTicket(modalTicket.id, { ...modalDraft, resolvedPhoto: ["Resolved", "Closed"].includes(modalDraft.status) ? modalDraft.resolvedPhoto : "" }, { type: "Admin", text: "Ticket updated from popup" });
        setModalMode("view");
        await showSuccessPopup("Ticket Updated", "Ticket details updated successfully.");
    };

    const openCreate = () => {
        setEditingTicket(null);
        setForm({ ...emptyForm, ticketId: `TKT-${Date.now().toString().slice(-6)}`, createdDate: todayISO() });
        setActiveTab("Create Ticket");
    };

    const submitTicket = async (event) => {
        event.preventDefault();
        if (!form.studentName || !form.roomNumber || !form.issueLocationType || !form.issueLocationDetail) {
            await showErrorPopup(
                "Ticket Details Required",
                "Student, room, affected location type, and affected location detail are required.",
            );
            return;
        }
        if (form.assignedStaff === "__other__" && (!form.thirdPartyName || !form.thirdPartyPhone)) {
            await showErrorPopup("Third-Party Details Required", "Third-party name and phone number are required.");
            return;
        }
        const ticketId = editingTicket?.id || Date.now();
        const payload = {
            ...form,
            id: ticketId,
            ticketId: form.ticketId || `TKT-${String(ticketId).slice(-6)}`,
            createdAt: form.createdAt || todayISO(),
            createdDate: form.createdDate || todayISO(),
            status: form.assignedStaff && form.status === "Pending" ? "Assigned" : form.status,
            resolvedPhoto: ["Resolved", "Closed"].includes(form.status) ? form.resolvedPhoto : "",
            notes: form.notes || [],
        };

        const next = editingTicket
            ? tickets.map((ticket) => (String(ticket.id) === String(editingTicket.id) ? { ...ticket, ...payload, updatedAt: todayISO() } : ticket))
            : [{ ...payload, notes: [{ id: Date.now(), type: "System", text: "Ticket created", date: todayISO() }] }, ...tickets];

        saveAllTickets(next);
        setSelectedTicketId(ticketId);
        setEditingTicket(null);
        setForm(emptyForm);
        setActiveTab("All Tickets");
        await showSuccessPopup(
            editingTicket ? "Ticket Updated" : "Ticket Created",
            editingTicket ? "Ticket updated successfully." : "Ticket created successfully.",
        );
    };

    const deleteTicket = async (ticket) => {
        const confirmed = await showConfirmPopup({
            title: "Delete Ticket?",
            text: `Delete ${ticket.ticketId}? This action cannot be undone.`,
            confirmButtonText: "Delete Ticket",
        });
        if (!confirmed) return false;
        saveAllTickets(tickets.filter((item) => String(item.id) !== String(ticket.id)));
        if (String(selectedTicketId) === String(ticket.id)) setSelectedTicketId("");
        await showSuccessPopup("Ticket Deleted", `${ticket.ticketId} deleted successfully.`);
        return true;
    };

    const closeTicket = async (ticket) => {
        const confirmed = await showConfirmPopup({
            icon: "question",
            title: "Close Ticket?",
            text: `Close ${ticket.ticketId}?`,
            confirmButtonText: "Close Ticket",
            confirmButtonColor: "#16a34a",
        });
        if (!confirmed) return;
        updateTicket(ticket.id, { status: "Closed", closedDate: todayISO() }, { type: "Admin", text: "Ticket closed" });
        await showSuccessPopup("Ticket Closed", `${ticket.ticketId} closed successfully.`);
    };

    const changeResolvedPhoto = async (ticket, file) => {
        if (!["Resolved", "Closed"].includes(ticket.status)) {
            await showErrorPopup(
                "Photo Upload Locked",
                "Resolved photo can be uploaded only after the ticket status is Resolved or Closed.",
            );
            return;
        }
        const resolvedPhoto = await readFileAsDataUrl(file);
        if (resolvedPhoto) {
            updateTicket(ticket.id, { resolvedPhoto }, { type: "Staff", text: "Completion photo uploaded" });
        }
    };

    const handleFormPhoto = async (key, file) => {
        const value = await readFileAsDataUrl(file);
        if (value) setForm((current) => ({ ...current, [key]: value }));
    };

    const addAdminNote = (ticket) => {
        if (!adminNote.trim()) return;
        updateTicket(ticket.id, { adminNote }, { type: "Admin", text: adminNote });
        setAdminNote("");
    };

    const scopedReportTickets = tickets
        .filter((ticket) => reportFilters.staff === "All" || assigneeLabel(ticket) === reportFilters.staff)
        .filter((ticket) => reportFilters.status === "All" || ticket.status === reportFilters.status)
        .filter((ticket) => reportFilters.priority === "All" || ticket.priority === reportFilters.priority)
        .filter((ticket) => !reportFilters.date || ticket.createdDate === reportFilters.date)
        .filter((ticket) => !reportFilters.month || String(ticket.createdDate || "").slice(5, 7) === reportFilters.month)
        .filter((ticket) => !reportFilters.year || String(ticket.createdDate || "").slice(0, 4) === reportFilters.year)
        .filter((ticket) => !reportFilters.student || String(ticket.studentName || "").toLowerCase().includes(reportFilters.student.toLowerCase()))
        .filter((ticket) => !reportFilters.room || String(ticket.roomNumber || "").toLowerCase().includes(reportFilters.room.toLowerCase()))
        .filter((ticket) => !reportFilters.bed || String(ticket.bedNumber || "").toLowerCase().includes(reportFilters.bed.toLowerCase()))
        .filter((ticket) => !reportFilters.table || String(ticket.tableNumber || "").toLowerCase().includes(reportFilters.table.toLowerCase()))
        .filter((ticket) => !reportFilters.cupboard || String(ticket.cupboardNumber || "").toLowerCase().includes(reportFilters.cupboard.toLowerCase()));
    const assigneeOptions = uniqueValues(tickets.map(assigneeLabel));

    const reportRows = scopedReportTickets.map((ticket) => [
        ticket.ticketId,
        ticket.title,
        ticket.studentName,
        ticket.roomNumber,
        ticket.bedNumber,
        ticket.tableNumber,
        ticket.cupboardNumber,
        assetLabel(ticket),
        ticket.category,
        ticket.priority,
        assigneeLabel(ticket),
        ticket.status,
        ticket.createdDate,
    ]);

    const downloadFile = (filename, content, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcelReport = () => {
        const table = `<table><thead><tr>${reportColumns.map((column) => `<th>${column}</th>`).join("")}</tr></thead><tbody>${reportRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell || "").replaceAll("<", "&lt;")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        downloadFile(`maintenance-ticket-report-${todayISO()}.xls`, table, "application/vnd.ms-excel");
    };

    const downloadPdfReport = () => {
        const reportWindow = window.open("", "_blank", "width=1100,height=800");
        if (!reportWindow) return;
        reportWindow.document.write(`
            <html>
                <head>
                    <title>Maintenance Ticket Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                        h1 { margin: 0 0 8px; }
                        p { color: #64748b; }
                        table { border-collapse: collapse; width: 100%; font-size: 12px; }
                        th, td { border: 1px solid #dbe3ef; padding: 8px; text-align: left; vertical-align: top; }
                        th { background: #f1f5f9; }
                    </style>
                </head>
                <body>
                    <h1>Maintenance Ticket Report</h1>
                    <p>Generated on ${todayISO()} | ${scopedReportTickets.length} tickets</p>
                    <table><thead><tr>${reportColumns.map((column) => `<th>${column}</th>`).join("")}</tr></thead><tbody>${reportRows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell || "").replaceAll("<", "&lt;")}</td>`).join("")}</tr>`).join("")}</tbody></table>
                    <script>window.onload = function () { window.print(); };</script>
                </body>
            </html>
        `);
        reportWindow.document.close();
    };

    const shareReportText = () => `Maintenance Ticket Report (${todayISO()}): Total ${scopedReportTickets.length}, Pending ${scopedReportTickets.filter((ticket) => ticket.status === "Pending").length}, In Progress ${scopedReportTickets.filter((ticket) => ticket.status === "In Progress").length}, Resolved ${scopedReportTickets.filter((ticket) => ticket.status === "Resolved").length}, Urgent ${scopedReportTickets.filter((ticket) => ticket.priority === "Urgent").length}.`;

    const sendReportMail = () => {
        window.location.href = `mailto:?subject=${encodeURIComponent("Maintenance Ticket Report")}&body=${encodeURIComponent(shareReportText())}`;
    };

    const sendReportWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareReportText())}`, "_blank", "noopener,noreferrer");
    };

    const renderFlow = () => (
        <div className="rounded-lg border bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-black text-slate-900">Ticket Flow</h2>
                    <p className="text-xs text-slate-500">Create to closure in six steps.</p>
                </div>
                <Wrench className="h-5 w-5 text-violet-600" />
            </div>
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {flowSteps.map((step, index) => (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2" key={step}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-black text-white">{index + 1}</span>
                        <span className="text-xs font-bold text-slate-700">{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFilters = () => (
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
            <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input className="pg-input pl-9" placeholder="Search by ID, title, student, category, staff..." value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} />
            </label>
            <select className="pg-input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option>All</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select className="pg-input" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
                <option>All</option>
                {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <input className="pg-input" placeholder="Filter room" value={filters.room} onChange={(event) => setFilters({ ...filters, room: event.target.value })} />
        </div>
    );

    const renderTable = () => (
        <ThemePanel
            title="Ticket List"
            description="Edit, assign, update status, close, or delete tickets with confirmation."
            actions={<button className="pg-button-primary" type="button" onClick={openCreate}><Plus size={18} /> New Ticket</button>}
        >
            {renderFilters()}
            <div className="mt-5 space-y-3">
                <div className="hidden rounded-lg bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500 xl:grid xl:grid-cols-[0.85fr_1.7fr_1.2fr_1.05fr_1.55fr_0.9fr_0.85fr] xl:gap-4">
                    {["Ticket", "Issue", "Student / Room", "Type", "Assignment", "Created", "Action"].map((header) => <span key={header}>{header}</span>)}
                </div>
                {filteredTickets.map((ticket) => (
                    <article className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:border-violet-200 hover:shadow" key={ticket.id}>
                        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-[0.85fr_1.7fr_1.2fr_1.05fr_1.55fr_0.9fr_0.85fr] xl:items-center xl:gap-4">
                            <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase text-slate-400 xl:hidden">Ticket</p>
                                <p className="truncate text-base font-black text-slate-900 xl:text-sm">{ticket.ticketId}</p>
                                <StatusBadge tone={statusTone[ticket.status]}>{ticket.status}</StatusBadge>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase text-slate-400 xl:hidden">Issue</p>
                                <button className="line-clamp-2 text-left font-bold leading-5 text-violet-700" type="button" onClick={() => openTicketModal(ticket, "view")}>{ticket.title || "Untitled issue"}</button>
                                {ticket.description && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{ticket.description}</p>}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase text-slate-400 xl:hidden">Student / Room</p>
                                <p className="break-words font-semibold text-slate-800">{ticket.studentName || "-"}</p>
                                <p className="mt-1 text-xs text-slate-500">Room {ticket.roomNumber || "-"} - {assetLabel(ticket)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-slate-400 xl:hidden">Type</p>
                                <p className="font-semibold text-slate-700">{ticket.category}</p>
                                <div className="mt-2"><StatusBadge tone={priorityTone[ticket.priority]}>{ticket.priority}</StatusBadge></div>
                            </div>
                            <div>
                                <p className="mb-2 text-[11px] font-black uppercase text-slate-400 xl:hidden">Assignment</p>
                                <select className="pg-input py-2" value={ticket.assignedStaff} onChange={(event) => updateTicket(ticket.id, { assignedStaff: event.target.value, status: event.target.value && ticket.status === "Pending" ? "Assigned" : ticket.status }, { type: "Admin", text: `Assigned to ${event.target.value === "__other__" ? "third party" : event.target.value || "none"}` })}>
                                    <option value="">Unassigned</option>
                                    {staffNames.map((staff) => <option key={staff}>{staff}</option>)}
                                    <option value="__other__">Other / Third party</option>
                                </select>
                                {ticket.assignedStaff === "__other__" && <p className="mt-1 text-xs font-semibold text-slate-500">{assigneeLabel(ticket)}</p>}
                                <select className="pg-input mt-2 py-2" value={ticket.status} onChange={(event) => updateTicket(ticket.id, { status: event.target.value, resolvedDate: event.target.value === "Resolved" ? todayISO() : ticket.resolvedDate }, { type: "Admin", text: `Status changed to ${event.target.value}` })}>
                                    {statuses.map((status) => <option key={status}>{status}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase text-slate-400 xl:hidden">Created</p>
                                <p className="text-slate-700">{ticket.createdDate}</p>
                            </div>
                            <div>
                                <p className="mb-1 text-[11px] font-black uppercase text-slate-400 xl:hidden">Action</p>
                                <div className="flex flex-wrap gap-2 xl:flex-nowrap">
                                    <button className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100" title="View" type="button" onClick={() => openTicketModal(ticket, "view")}><Eye size={16} /></button>
                                    <button className="rounded-lg border p-2 text-violet-600 hover:bg-violet-50" title="Edit" type="button" onClick={() => openTicketModal(ticket, "edit")}><Edit3 size={16} /></button>
                                    <button className="rounded-lg border p-2 text-emerald-600 hover:bg-emerald-50" title="Close" type="button" onClick={() => closeTicket(ticket)}><CheckCircle2 size={16} /></button>
                                    <button className="rounded-lg border p-2 text-red-600 hover:bg-red-50" title="Delete" type="button" onClick={() => deleteTicket(ticket)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
                {!filteredTickets.length && <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-400">No tickets match these filters.</div>}
            </div>
        </ThemePanel>
    );

    const renderCreateForm = () => (
        <ThemePanel title={editingTicket ? "Edit Ticket" : "Create Ticket"} description="Capture the full maintenance issue record for admin and staff follow-up.">
            <form className="grid gap-4 lg:grid-cols-2" onSubmit={submitTicket}>
                <input className="pg-input" placeholder="Ticket ID" value={form.ticketId} onChange={(event) => setForm({ ...form, ticketId: event.target.value })} />
                <input className="pg-input" type="date" value={form.createdDate} onChange={(event) => setForm({ ...form, createdDate: event.target.value })} />
                {students.length ? (
                    <select className="pg-input" value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} required>
                        <option value="">Select student</option>
                        {students.map((student) => <option key={student.id} value={student.name}>{student.name}</option>)}
                    </select>
                ) : (
                    <input className="pg-input" placeholder="Student Name" value={form.studentName} onChange={(event) => setForm({ ...form, studentName: event.target.value })} required />
                )}
                <select className="pg-input" value={form.roomNumber} onChange={(event) => setForm({ ...form, roomNumber: event.target.value })} required>
                    <option value="">Select room</option>
                    {roomOptions.map((room) => <option key={room}>{room}</option>)}
                </select>
                <input className="pg-input" list="bed-list" placeholder="Bed Number" value={form.bedNumber} onChange={(event) => setForm({ ...form, bedNumber: event.target.value })} />
                <datalist id="bed-list">{bedOptions.map((bed) => <option key={bed} value={bed} />)}</datalist>
                <input className="pg-input" list="table-list" placeholder="Table Number" value={form.tableNumber} onChange={(event) => setForm({ ...form, tableNumber: event.target.value })} />
                <datalist id="table-list">{tableOptions.map((table) => <option key={table} value={table} />)}</datalist>
                <input className="pg-input" list="cupboard-list" placeholder="Cupboard Number" value={form.cupboardNumber} onChange={(event) => setForm({ ...form, cupboardNumber: event.target.value })} />
                <datalist id="cupboard-list">{cupboardOptions.map((cupboard) => <option key={cupboard} value={cupboard} />)}</datalist>
                <select className="pg-input" value={form.issueLocationType} onChange={(event) => setForm({ ...form, issueLocationType: event.target.value, issueLocationDetail: "" })} required>{locationTypes.map((item) => <option key={item}>{item}</option>)}</select>
                <input className="pg-input" placeholder={`${form.issueLocationType} detail`} value={form.issueLocationDetail} onChange={(event) => setForm({ ...form, issueLocationDetail: event.target.value })} required />
                <select className="pg-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                <select className="pg-input" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
                <input className="pg-input lg:col-span-2" placeholder="Issue Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                <textarea className="pg-input lg:col-span-2" rows="4" placeholder="Issue Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                <select className="pg-input" value={form.assignedStaff} onChange={(event) => setForm({ ...form, assignedStaff: event.target.value, status: event.target.value && form.status === "Pending" ? "Assigned" : form.status })}><option value="">Assign staff later</option>{staffNames.map((staff) => <option key={staff}>{staff}</option>)}<option value="__other__">Other / Third party</option></select>
                <select className="pg-input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                {form.assignedStaff === "__other__" && (
                    <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 lg:col-span-2 lg:grid-cols-3">
                        <input className="pg-input" placeholder="Third-party name" value={form.thirdPartyName} onChange={(event) => setForm({ ...form, thirdPartyName: event.target.value })} required />
                        <input className="pg-input" placeholder="Third-party phone" value={form.thirdPartyPhone} onChange={(event) => setForm({ ...form, thirdPartyPhone: event.target.value })} required />
                        <input className="pg-input" placeholder="Reference / agency" value={form.thirdPartyReference} onChange={(event) => setForm({ ...form, thirdPartyReference: event.target.value })} />
                    </div>
                )}
                <label className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    <span className="mb-2 flex items-center gap-2 font-bold text-slate-700"><Camera size={16} /> Photo Upload</span>
                    <input type="file" accept="image/*" onChange={(event) => handleFormPhoto("photo", event.target.files?.[0])} />
                </label>
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Resolved photo unlocks after the ticket is marked Resolved.
                </div>
                <textarea className="pg-input lg:col-span-2" rows="3" placeholder="Admin Note" value={form.adminNote} onChange={(event) => setForm({ ...form, adminNote: event.target.value })} />
                <div className="flex flex-wrap gap-3 lg:col-span-2">
                    <button className="pg-button-primary" type="submit"><ListChecks size={18} /> {editingTicket ? "Update Ticket" : "Save Ticket"}</button>
                    <button className="rounded-lg border px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50" type="button" onClick={() => { setEditingTicket(null); setForm(emptyForm); setActiveTab("All Tickets"); }}>Cancel</button>
                </div>
            </form>
        </ThemePanel>
    );

    const renderStaffWork = () => (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <ThemePanel title="Assigned Tickets" description="Staff can accept work, update progress, add notes, upload completion photo, and resolve.">
                <div className="space-y-3">
                    {tickets.filter((ticket) => ticket.assignedStaff && !["Closed", "Rejected"].includes(ticket.status)).map((ticket) => (
                        <button className={`w-full rounded-lg border p-4 text-left transition hover:border-violet-300 ${String(selectedTicket?.id) === String(ticket.id) ? "border-violet-500 bg-violet-50" : "bg-white"}`} type="button" key={ticket.id} onClick={() => { setSelectedTicketId(ticket.id); setStaffDraft({ status: ticket.status, workNote: ticket.workNote || "" }); }}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <p className="font-black text-slate-900">{ticket.ticketId} - {ticket.title}</p>
                                    <p className="mt-1 text-sm text-slate-500">{assigneeLabel(ticket)} - Room {ticket.roomNumber || "-"} - {assetLabel(ticket)}</p>
                                </div>
                                <StatusBadge tone={statusTone[ticket.status]}>{ticket.status}</StatusBadge>
                            </div>
                        </button>
                    ))}
                    {!tickets.some((ticket) => ticket.assignedStaff && !["Closed", "Rejected"].includes(ticket.status)) && <p className="text-sm text-slate-400">No assigned tickets.</p>}
                </div>
            </ThemePanel>
            {selectedTicket ? (
                <ThemePanel title="Staff Update Panel" description={`${selectedTicket.assignedStaff || "Unassigned"} - ${selectedTicket.ticketId}`}>
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <select className="pg-input" value={staffDraft.status || selectedTicket.status} onChange={(event) => setStaffDraft({ ...staffDraft, status: event.target.value })}>
                                {statuses.filter((status) => !["Rejected", "Closed"].includes(status)).map((status) => <option key={status}>{status}</option>)}
                            </select>
                            <button className="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-slate-50" type="button" onClick={() => updateTicket(selectedTicket.id, { status: "Assigned" }, { type: "Staff", text: "Ticket accepted" })}>Accept Ticket</button>
                        </div>
                        <textarea className="pg-input" rows="4" placeholder="Add work note" value={staffDraft.workNote} onChange={(event) => setStaffDraft({ ...staffDraft, workNote: event.target.value })} />
                        <div className="flex flex-wrap gap-3">
                            <button className="pg-button-primary" type="button" onClick={() => updateTicket(selectedTicket.id, { status: staffDraft.status || selectedTicket.status, workNote: staffDraft.workNote, resolvedDate: (staffDraft.status || selectedTicket.status) === "Resolved" ? todayISO() : selectedTicket.resolvedDate }, { type: "Staff", text: staffDraft.workNote || `Status updated to ${staffDraft.status || selectedTicket.status}` })}>Save / Update</button>
                            <button className="rounded-lg border px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-50" type="button" onClick={() => openTicketModal(selectedTicket, "edit")}>Edit Ticket</button>
                            <button className="rounded-lg border px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50" type="button" onClick={() => updateTicket(selectedTicket.id, { status: "Resolved", resolvedDate: todayISO() }, { type: "Staff", text: "Marked resolved" })}>Mark Resolved</button>
                            <label className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold ${["Resolved", "Closed"].includes(selectedTicket.status) ? "cursor-pointer text-slate-600 hover:bg-slate-50" : "cursor-not-allowed bg-slate-50 text-slate-400"}`}>
                                <Camera size={16} /> Completion Photo
                                <input className="hidden" type="file" accept="image/*" disabled={!["Resolved", "Closed"].includes(selectedTicket.status)} onChange={(event) => changeResolvedPhoto(selectedTicket, event.target.files?.[0])} />
                            </label>
                        </div>
                    </div>
                </ThemePanel>
            ) : (
                <ThemePanel title="Staff Update Panel" description="Select an assigned ticket to update it."><p className="text-sm text-slate-400">No ticket selected.</p></ThemePanel>
            )}
        </div>
    );

    const renderReports = () => (
        <div className="space-y-5">
            <ThemePanel title="Report Actions" description="Download the current MTM report or share a quick summary with your team.">
                <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <select className="pg-input" value={reportFilters.staff} onChange={(event) => setReportFilters({ ...reportFilters, staff: event.target.value })}>
                        <option>All</option>
                        {assigneeOptions.map((staff) => <option key={staff}>{staff}</option>)}
                    </select>
                    <select className="pg-input" value={reportFilters.status} onChange={(event) => setReportFilters({ ...reportFilters, status: event.target.value })}>
                        <option>All</option>
                        {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <select className="pg-input" value={reportFilters.priority} onChange={(event) => setReportFilters({ ...reportFilters, priority: event.target.value })}>
                        <option>All</option>
                        {priorities.map((priority) => <option key={priority}>{priority}</option>)}
                    </select>
                    <input className="pg-input" type="date" value={reportFilters.date} onChange={(event) => setReportFilters({ ...reportFilters, date: event.target.value })} />
                    <input className="pg-input" placeholder="Month (01-12)" value={reportFilters.month} onChange={(event) => setReportFilters({ ...reportFilters, month: event.target.value ? event.target.value.padStart(2, "0").slice(-2) : "" })} />
                    <input className="pg-input" placeholder="Year" value={reportFilters.year} onChange={(event) => setReportFilters({ ...reportFilters, year: event.target.value })} />
                    <input className="pg-input" placeholder="Student" value={reportFilters.student} onChange={(event) => setReportFilters({ ...reportFilters, student: event.target.value })} />
                    <input className="pg-input" placeholder="Room" value={reportFilters.room} onChange={(event) => setReportFilters({ ...reportFilters, room: event.target.value })} />
                    <input className="pg-input" placeholder="Bed" value={reportFilters.bed} onChange={(event) => setReportFilters({ ...reportFilters, bed: event.target.value })} />
                    <input className="pg-input" placeholder="Table" value={reportFilters.table} onChange={(event) => setReportFilters({ ...reportFilters, table: event.target.value })} />
                    <input className="pg-input" placeholder="Cupboard" value={reportFilters.cupboard} onChange={(event) => setReportFilters({ ...reportFilters, cupboard: event.target.value })} />
                    <button className="rounded-lg border px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50" type="button" onClick={() => setReportFilters({ staff: "All", date: "", month: "", year: "", student: "", room: "", bed: "", table: "", cupboard: "", status: "All", priority: "All" })}>Clear Filters</button>
                </div>
                <p className="mb-3 text-sm font-semibold text-slate-500">{scopedReportTickets.length} ticket(s) match this report scope.</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <button className="rounded-lg border px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" type="button" onClick={downloadPdfReport}><Printer size={18} className="inline-block" /> Download PDF</button>
                    <button className="rounded-lg border px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" type="button" onClick={downloadExcelReport}><BarChart3 size={18} className="inline-block" /> Download Excel</button>
                    <button className="rounded-lg border px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" type="button" onClick={sendReportMail}><Mail size={18} className="inline-block" /> Send Mail</button>
                    <button className="rounded-lg border px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" type="button" onClick={sendReportWhatsApp}><MessageCircle size={18} className="inline-block" /> WhatsApp</button>
                </div>
            </ThemePanel>
            <div className="grid gap-5 xl:grid-cols-2">
            <ThemePanel title="Priority Guide" description="Suggested priority mapping for common PG issues.">
                <div className="space-y-3 text-sm">
                    {[["Fan issue", "Medium"], ["Water leakage", "High"], ["Electric shock issue", "Urgent"], ["Cleaning request", "Low"], ["WiFi down for room", "High"], ["Security concern", "Urgent"]].map(([issue, priority]) => (
                        <div className="flex items-center justify-between rounded-lg border p-3" key={issue}>
                            <span className="font-semibold text-slate-700">{issue}</span>
                            <StatusBadge tone={priorityTone[priority]}>{priority}</StatusBadge>
                        </div>
                    ))}
                </div>
            </ThemePanel>
            <ThemePanel title="Staff Workload" description="Active tickets currently assigned to staff.">
                <div className="space-y-3">
                    {workload.map((item) => (
                        <div className="rounded-lg border p-4" key={item.staff}>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-black text-slate-900">{item.staff}</p>
                                <p className="text-sm text-slate-500">{item.total} active</p>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-2 rounded-full bg-violet-600" style={{ width: `${Math.min(item.total * 20, 100)}%` }} />
                            </div>
                            {item.urgent > 0 && <p className="mt-2 text-xs font-bold text-red-600">{item.urgent} urgent ticket(s)</p>}
                        </div>
                    ))}
                </div>
            </ThemePanel>
            </div>
        </div>
    );

    const renderTicketModal = () => modalTicket && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b bg-white px-5 py-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Ticket Details</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">{modalTicket.ticketId}</h2>
                        <p className="text-sm text-slate-500">{modalTicket.title || "Untitled issue"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {modalMode === "view" ? (
                            <button className="rounded-lg border px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50" type="button" onClick={() => { setModalDraft({ ...emptyForm, ...modalTicket }); setModalMode("edit"); }}>
                                <Edit3 size={16} className="inline-block" /> Edit
                            </button>
                        ) : (
                            <button className="pg-button-primary" type="button" onClick={saveModalTicket}>Update Ticket</button>
                        )}
                        <button className="rounded-lg border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50" type="button" onClick={closeTicketModal}>Close</button>
                    </div>
                </div>

                <div className="grid gap-5 p-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <StatusBadge tone={statusTone[modalTicket.status]}>{modalTicket.status}</StatusBadge>
                            <StatusBadge tone={priorityTone[modalTicket.priority]}>{modalTicket.priority}</StatusBadge>
                            <span className="pg-badge bg-slate-100 text-slate-700">{modalTicket.category}</span>
                        </div>

                        {modalMode === "edit" ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                <input className="pg-input" value={modalDraft.ticketId} onChange={(event) => setModalDraft({ ...modalDraft, ticketId: event.target.value })} />
                                <input className="pg-input" type="date" value={modalDraft.createdDate} onChange={(event) => setModalDraft({ ...modalDraft, createdDate: event.target.value })} />
                                <input className="pg-input" placeholder="Student Name" value={modalDraft.studentName} onChange={(event) => setModalDraft({ ...modalDraft, studentName: event.target.value })} />
                                <input className="pg-input" placeholder="Room Number" value={modalDraft.roomNumber} onChange={(event) => setModalDraft({ ...modalDraft, roomNumber: event.target.value })} />
                                <input className="pg-input" placeholder="Bed Number" value={modalDraft.bedNumber} onChange={(event) => setModalDraft({ ...modalDraft, bedNumber: event.target.value })} />
                                <input className="pg-input" placeholder="Table Number" value={modalDraft.tableNumber} onChange={(event) => setModalDraft({ ...modalDraft, tableNumber: event.target.value })} />
                                <input className="pg-input" placeholder="Cupboard Number" value={modalDraft.cupboardNumber} onChange={(event) => setModalDraft({ ...modalDraft, cupboardNumber: event.target.value })} />
                                <select className="pg-input" value={modalDraft.issueLocationType} onChange={(event) => setModalDraft({ ...modalDraft, issueLocationType: event.target.value, issueLocationDetail: "" })}>{locationTypes.map((item) => <option key={item}>{item}</option>)}</select>
                                <input className="pg-input" placeholder="Affected location detail" value={modalDraft.issueLocationDetail} onChange={(event) => setModalDraft({ ...modalDraft, issueLocationDetail: event.target.value })} />
                                <select className="pg-input" value={modalDraft.category} onChange={(event) => setModalDraft({ ...modalDraft, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                                <select className="pg-input" value={modalDraft.priority} onChange={(event) => setModalDraft({ ...modalDraft, priority: event.target.value })}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select>
                                <select className="pg-input" value={modalDraft.status} onChange={(event) => setModalDraft({ ...modalDraft, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                                <select className="pg-input md:col-span-2" value={modalDraft.assignedStaff} onChange={(event) => setModalDraft({ ...modalDraft, assignedStaff: event.target.value })}><option value="">Unassigned</option>{staffNames.map((staff) => <option key={staff}>{staff}</option>)}<option value="__other__">Other / Third party</option></select>
                                {modalDraft.assignedStaff === "__other__" && (
                                    <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 md:col-span-2 md:grid-cols-3">
                                        <input className="pg-input" placeholder="Third-party name" value={modalDraft.thirdPartyName} onChange={(event) => setModalDraft({ ...modalDraft, thirdPartyName: event.target.value })} />
                                        <input className="pg-input" placeholder="Third-party phone" value={modalDraft.thirdPartyPhone} onChange={(event) => setModalDraft({ ...modalDraft, thirdPartyPhone: event.target.value })} />
                                        <input className="pg-input" placeholder="Reference / agency" value={modalDraft.thirdPartyReference} onChange={(event) => setModalDraft({ ...modalDraft, thirdPartyReference: event.target.value })} />
                                    </div>
                                )}
                                <input className="pg-input md:col-span-2" placeholder="Issue title" value={modalDraft.title} onChange={(event) => setModalDraft({ ...modalDraft, title: event.target.value })} />
                                <textarea className="pg-input md:col-span-2" rows="4" placeholder="Issue description" value={modalDraft.description} onChange={(event) => setModalDraft({ ...modalDraft, description: event.target.value })} />
                            </div>
                        ) : (
                            <>
                                <p className="text-sm leading-6 text-slate-600">{modalTicket.description || "No description provided."}</p>
                                <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                                    <p><span className="font-bold">Student:</span> {modalTicket.studentName || "-"}</p>
                                    <p><span className="font-bold">Room:</span> {modalTicket.roomNumber || "-"}</p>
                                    <p><span className="font-bold">Location:</span> {assetLabel(modalTicket)}</p>
                                    <p><span className="font-bold">Assigned:</span> {assigneeLabel(modalTicket)}</p>
                                    {modalTicket.thirdPartyReference && <p><span className="font-bold">Reference:</span> {modalTicket.thirdPartyReference}</p>}
                                    <p><span className="font-bold">Created:</span> {modalTicket.createdDate}</p>
                                </div>
                            </>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            {modalTicket.photo && <img className="h-48 w-full rounded-lg border object-cover" src={modalTicket.photo} alt="Issue" />}
                            {modalTicket.resolvedPhoto && <img className="h-48 w-full rounded-lg border object-cover" src={modalTicket.resolvedPhoto} alt="Resolved" />}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <h3 className="font-black text-slate-900">Quick Actions</h3>
                            <div className="mt-3 grid gap-2">
                                <select className="pg-input" value={modalTicket.status} onChange={(event) => updateTicket(modalTicket.id, { status: event.target.value, resolvedDate: event.target.value === "Resolved" ? todayISO() : modalTicket.resolvedDate }, { type: "Admin", text: `Status changed to ${event.target.value}` })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                                <select className="pg-input" value={modalTicket.assignedStaff} onChange={(event) => updateTicket(modalTicket.id, { assignedStaff: event.target.value, status: event.target.value && modalTicket.status === "Pending" ? "Assigned" : modalTicket.status }, { type: "Admin", text: `Assigned to ${event.target.value === "__other__" ? "third party" : event.target.value || "none"}` })}><option value="">Assign staff</option>{staffNames.map((staff) => <option key={staff}>{staff}</option>)}<option value="__other__">Other / Third party</option></select>
                                <textarea className="pg-input" rows="3" placeholder="Add admin note" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
                                <button className="pg-button-primary" type="button" onClick={() => addAdminNote(modalTicket)}>Add Admin Note</button>
                                <label className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold ${["Resolved", "Closed"].includes(modalTicket.status) ? "cursor-pointer text-slate-600 hover:bg-slate-50" : "cursor-not-allowed bg-slate-50 text-slate-400"}`}>
                                    <Camera size={16} /> {["Resolved", "Closed"].includes(modalTicket.status) ? "Upload Resolved Photo" : "Resolve ticket to upload photo"}
                                    <input className="hidden" type="file" accept="image/*" disabled={!["Resolved", "Closed"].includes(modalTicket.status)} onChange={(event) => changeResolvedPhoto(modalTicket, event.target.files?.[0])} />
                                </label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <button className="rounded-lg border px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50" type="button" onClick={() => closeTicket(modalTicket)}>Close Ticket</button>
                                    <button className="rounded-lg border px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50" type="button" onClick={() => { if (deleteTicket(modalTicket)) closeTicketModal(); }}>Delete</button>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h3 className="font-black text-slate-900">Activity</h3>
                            <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
                                {(modalTicket.notes || []).map((note) => (
                                    <div className="rounded-lg bg-slate-50 p-3 text-sm" key={note.id}>
                                        <p className="font-bold text-slate-900">{note.type || "Note"} <span className="font-normal text-slate-400">- {note.date}</span></p>
                                        <p className="text-slate-600">{note.text}</p>
                                    </div>
                                ))}
                                {!modalTicket.notes?.length && <p className="text-sm text-slate-400">No activity yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Operations"
                    title="Maintenance Ticket Management"
                    description="Create, assign, track, resolve, and close student/admin maintenance tickets from one responsive workspace."
                    actions={<button className="pg-button-primary" type="button" onClick={openCreate}><Plus size={18} /> Create Ticket</button>}
                />

                <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-2">
                    {ticketPages.map(({ tab }) => (
                        <button className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} key={tab} type="button" onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "Dashboard" && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map(([title, value, detail, Icon, tone]) => <StatCard key={title} title={title} value={value} detail={detail} icon={Icon} tone={tone} />)}
                        </div>
                        {renderFlow()}
                        {renderTable()}
                    </>
                )}

                {activeTab === "All Tickets" && (
                    <div className="space-y-5">
                        {renderFlow()}
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><Filter size={16} /> Filters and actions</div>
                        {renderTable()}
                    </div>
                )}

                {activeTab === "Create Ticket" && <>{renderFlow()}{renderCreateForm()}</>}
                {activeTab === "Staff Workload" && <>{renderFlow()}{renderStaffWork()}</>}
                {activeTab === "Reports" && <>{renderFlow()}{renderReports()}</>}
                {renderTicketModal()}
            </div>
        </AdminLayout>
    );
};

export default MaintenanceTickets;
