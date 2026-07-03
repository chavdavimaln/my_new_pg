import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarDays, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getAdmissions, getCalendarEvents, getInquiries, saveCalendarEvents, todayISO } from "../../Utils/pgRequirementStore";
import { getStoredPayments } from "../../Utils/paymentHelper";
import { showInfoPopup } from "../../../utils/popup";

const eventTypes = ["Follow-up", "Renewal", "Admission", "Payment", "Room Cleaning", "Maintenance"];
const eventColors = {
    "Follow-up": "#7c3aed",
    Renewal: "#059669",
    Admission: "#2563eb",
    Payment: "#ea580c",
    "Room Cleaning": "#0891b2",
    Maintenance: "#dc2626",
};

const CalendarOperations = () => {
    const [events, setEvents] = useState(getCalendarEvents());
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [form, setForm] = useState({ title: "", type: "Follow-up", date: todayISO(), assignedTo: "", notes: "" });
    const [editingId, setEditingId] = useState("");
    const inquiries = getInquiries();
    const admissions = getAdmissions();
    const payments = getStoredPayments();

    const generatedEvents = [
        ...inquiries.filter((item) => item.followUp).map((item) => ({ id: `lead-${item.id}`, date: item.followUp, type: "Follow-up", title: item.name, assignedTo: item.phone })),
        ...admissions.map((item) => ({ id: `adm-${item.id}`, date: item.createdAt || todayISO(), type: "Admission", title: item.name, assignedTo: item.status })),
        ...payments.filter((item) => item.dueDate).map((item) => ({ id: `pay-${item.id}`, date: item.dueDate, type: "Payment", title: item.studentName || "Payment due", assignedTo: item.status })),
        ...events,
    ];

    const stats = {
        followups: generatedEvents.filter((event) => event.type === "Follow-up").length,
        renewals: generatedEvents.filter((event) => event.type === "Renewal").length,
        admissions: generatedEvents.filter((event) => event.type === "Admission").length,
        payments: generatedEvents.filter((event) => event.type === "Payment").length,
    };

    const selectedEvents = generatedEvents.filter((event) => event.date === selectedDate);
    const calendarEvents = generatedEvents.map((item) => ({
        id: String(item.id),
        title: item.title || item.type,
        start: item.date,
        allDay: true,
        backgroundColor: eventColors[item.type] || "#64748b",
        borderColor: eventColors[item.type] || "#64748b",
        extendedProps: item,
    }));

    const toGoogleDate = (value) => `${String(value || "").replaceAll("-", "")}T090000`;
    const googleLink = (item) => {
        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: item.title || item.type,
            dates: `${toGoogleDate(item.date)}/${toGoogleDate(item.date)}`,
            details: `${item.type || ""}\n${item.assignedTo || ""}\n${item.notes || ""}`,
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const addEvent = (event) => {
        event.preventDefault();
        const next = editingId
            ? events.map((item) => (String(item.id) === String(editingId) ? { ...item, ...form, status: item.status || "Scheduled" } : item))
            : [{ ...form, id: Date.now(), status: "Scheduled" }, ...events];
        setEvents(next);
        saveCalendarEvents(next);
        setSelectedDate(form.date);
        setForm({ title: "", type: "Follow-up", date: todayISO(), assignedTo: "", notes: "" });
        setEditingId("");
    };

    const editEvent = (item) => {
        if (String(item.id).startsWith("lead-") || String(item.id).startsWith("adm-") || String(item.id).startsWith("pay-")) {
            showInfoPopup("Generated Event", "Generated events are edited from their source module.");
            return;
        }
        setEditingId(item.id);
        setForm({ title: item.title || "", type: item.type || "Follow-up", date: item.date || todayISO(), assignedTo: item.assignedTo || "", notes: item.notes || "" });
    };

    const deleteEvent = (eventId) => {
        const next = events.filter((item) => String(item.id) !== String(eventId));
        setEvents(next);
        saveCalendarEvents(next);
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-black text-blue-700">Calendar</h1>
                    <p className="text-sm text-slate-500">Followups, renewals, admissions & payments</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        ["Followups", stats.followups, "bg-violet-600"],
                        ["Renewals", stats.renewals, "bg-emerald-600"],
                        ["Admissions", stats.admissions, "bg-blue-600"],
                        ["Payments", stats.payments, "bg-orange-600"],
                    ].map(([label, value, tone]) => <div className={`${tone} rounded-xl p-4 text-white shadow`} key={label}><p className="text-sm">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
                    <div className="rounded-lg bg-white p-5 shadow">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-black">Schedule Event</h2>
                            <input className="pg-input max-w-xs" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                        </div>
                        <form className="grid gap-3 md:grid-cols-2" onSubmit={addEvent}>
                            <input className="pg-input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                            <select className="pg-input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{eventTypes.map((item) => <option key={item}>{item}</option>)}</select>
                            <input className="pg-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                            <input className="pg-input" placeholder="Assigned to" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} />
                            <textarea className="pg-input md:col-span-2" rows="3" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                            <button className="pg-button-primary md:col-span-2" type="submit"><Plus size={18} /> {editingId ? "Update Event" : "Add Event"}</button>
                        </form>
                    </div>

                    <aside className="rounded-lg bg-white p-5 shadow">
                        <div className="mb-4 flex items-center gap-2">
                            <CalendarDays size={20} className="text-blue-600" />
                            <div>
                                <h2 className="font-black">Select a Day</h2>
                                <p className="text-sm text-slate-500">{selectedDate}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {selectedEvents.map((item) => (
                                <div className="rounded-lg border p-3 text-sm" key={item.id}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-bold">{item.title || item.type}</p>
                                            <p className="text-slate-500">{item.type} - {item.assignedTo || "Unassigned"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={googleLink(item)} target="_blank" rel="noreferrer" title="Open in Google Calendar" className="text-emerald-600"><ExternalLink size={15} /></a>
                                            <button type="button" onClick={() => editEvent(item)} title="Edit event" className="text-violet-600"><Pencil size={15} /></button>
                                            {!String(item.id).startsWith("lead-") && !String(item.id).startsWith("adm-") && !String(item.id).startsWith("pay-") && (
                                                <button type="button" onClick={() => deleteEvent(item.id)} title="Delete event" className="text-red-600"><Trash2 size={15} /></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!selectedEvents.length && <p className="text-sm text-slate-400">No events for this day.</p>}
                        </div>
                    </aside>
                </div>

                <div className="rounded-lg bg-white p-4 shadow">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                        height="auto"
                        dayMaxEvents={3}
                        fixedWeekCount={false}
                        selectable
                        navLinks
                        dateClick={(info) => {
                            setSelectedDate(info.dateStr);
                            setForm((current) => ({ ...current, date: info.dateStr }));
                        }}
                        eventClick={(info) => {
                            const item = info.event.extendedProps;
                            setSelectedDate(info.event.startStr);
                            editEvent(item);
                        }}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridYear,dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        views={{
                            dayGridYear: {
                                dayMaxEvents: 2,
                                titleFormat: { year: "numeric" },
                            },
                            dayGridMonth: {
                                dayMaxEvents: 3,
                            },
                            timeGridWeek: {
                                dayMaxEvents: false,
                                slotMinTime: "07:00:00",
                                slotMaxTime: "22:00:00",
                            },
                            timeGridDay: {
                                dayMaxEvents: false,
                                slotMinTime: "07:00:00",
                                slotMaxTime: "22:00:00",
                            },
                        }}
                        buttonText={{
                            today: "Today",
                            year: "Year",
                            month: "Month",
                            week: "Week",
                            day: "Day",
                        }}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default CalendarOperations;
