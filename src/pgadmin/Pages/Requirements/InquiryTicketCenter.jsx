import React, { useState } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getInquiries, getTickets, saveInquiries, saveTickets, todayISO, validateSoft } from "../../Utils/pgRequirementStore";

const InquiryTicketCenter = () => {
    const [inquiries, setInquiries] = useState(getInquiries());
    const [tickets, setTickets] = useState(getTickets());
    const [inquiry, setInquiry] = useState({ name: "", phone: "", source: "Walk-in", requirement: "PG Stay", status: "New", notes: "" });
    const [ticket, setTicket] = useState({ title: "", category: "Maintenance", priority: "Medium", raisedBy: "", status: "Open", details: "" });
    const [warnings, setWarnings] = useState([]);

    const addInquiry = (event) => {
        event.preventDefault();
        const softWarnings = validateSoft(inquiry, { name: true, phone: true });
        setWarnings(softWarnings);
        if (softWarnings.length) return;
        const next = [{ ...inquiry, id: Date.now(), date: todayISO() }, ...inquiries];
        setInquiries(next);
        saveInquiries(next);
        setInquiry({ name: "", phone: "", source: "Walk-in", requirement: "PG Stay", status: "New", notes: "" });
    };

    const addTicket = (event) => {
        event.preventDefault();
        const next = [{ ...ticket, id: Date.now(), date: todayISO() }, ...tickets];
        setTickets(next);
        saveTickets(next);
        setTicket({ title: "", category: "Maintenance", priority: "Medium", raisedBy: "", status: "Open", details: "" });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader eyebrow="Operations" title="Inquiries & Tickets" description="Track walk-ins, phone inquiries, PG stay requests, library seat requests, maintenance tickets, and student support issues." />
                <div className="grid gap-6 xl:grid-cols-2">
                    <ThemePanel title="Add Inquiry" description="For new people who want to stay in the PG or use the library.">
                        {warnings.length > 0 && <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{warnings.join(", ")}</div>}
                        <form className="space-y-3" onSubmit={addInquiry}>
                            <input className="pg-input" placeholder="Name" value={inquiry.name} onChange={(event) => setInquiry({ ...inquiry, name: event.target.value })} />
                            <input className="pg-input" placeholder="Phone" value={inquiry.phone} onChange={(event) => setInquiry({ ...inquiry, phone: event.target.value })} />
                            <select className="pg-input" value={inquiry.requirement} onChange={(event) => setInquiry({ ...inquiry, requirement: event.target.value })}><option>PG Stay</option><option>Hostel Stay</option><option>Library Seat</option><option>Guest Stay</option></select>
                            <input className="pg-input" placeholder="Source" value={inquiry.source} onChange={(event) => setInquiry({ ...inquiry, source: event.target.value })} />
                            <textarea className="pg-input" rows="3" placeholder="Notes" value={inquiry.notes} onChange={(event) => setInquiry({ ...inquiry, notes: event.target.value })} />
                            <button className="pg-button-primary w-full" type="submit"><Plus size={18} /> Save Inquiry</button>
                        </form>
                    </ThemePanel>
                    <ThemePanel title="Raise Ticket" description="Maintenance, cleaning, payment, room transfer, document, and general support tickets.">
                        <form className="space-y-3" onSubmit={addTicket}>
                            <input className="pg-input" placeholder="Ticket title" value={ticket.title} onChange={(event) => setTicket({ ...ticket, title: event.target.value })} />
                            <input className="pg-input" placeholder="Raised by" value={ticket.raisedBy} onChange={(event) => setTicket({ ...ticket, raisedBy: event.target.value })} />
                            <select className="pg-input" value={ticket.category} onChange={(event) => setTicket({ ...ticket, category: event.target.value })}><option>Maintenance</option><option>Cleaning</option><option>Payment</option><option>Room Transfer</option><option>Documents</option><option>Other</option></select>
                            <select className="pg-input" value={ticket.priority} onChange={(event) => setTicket({ ...ticket, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select>
                            <textarea className="pg-input" rows="3" placeholder="Details" value={ticket.details} onChange={(event) => setTicket({ ...ticket, details: event.target.value })} />
                            <button className="pg-button-primary w-full" type="submit"><Plus size={18} /> Save Ticket</button>
                        </form>
                    </ThemePanel>
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                    <ThemePanel title="Inquiry List" description="Follow up and convert to admission.">
                        <div className="space-y-2">{inquiries.map((item) => <div className="rounded-lg border p-3" key={item.id}><p className="font-bold">{item.name} · {item.requirement}</p><p className="text-sm text-slate-500">{item.phone} · {item.source} · {item.status}</p></div>)}</div>
                    </ThemePanel>
                    <ThemePanel title="Ticket List" description="Resolve daily PG operations issues.">
                        <div className="space-y-2">{tickets.map((item) => <div className="rounded-lg border p-3" key={item.id}><p className="font-bold">{item.title || item.category}</p><p className="text-sm text-slate-500">{item.raisedBy || "Unknown"} · {item.priority} · {item.status}</p></div>)}</div>
                    </ThemePanel>
                </div>
            </div>
        </AdminLayout>
    );
};

export default InquiryTicketCenter;
