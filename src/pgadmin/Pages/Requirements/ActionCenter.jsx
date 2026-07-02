import React from "react";
import { AlertCircle, Bed, CalendarClock, UserCheck, UsersRound } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { getStoredAllocations, getStoredStudents } from "../../Utils/allocationHelper";
import { getAdmissions, getCalendarEvents, getInquiries, getPgOverview } from "../../Utils/pgRequirementStore";

const ActionCenter = () => {
    const overview = getPgOverview();
    const students = getStoredStudents();
    const allocations = getStoredAllocations();
    const admissions = getAdmissions();
    const inquiries = getInquiries();
    const events = getCalendarEvents();
    const today = new Date().toISOString().slice(0, 10);

    const approvedWithoutBed = students.filter(
        (student) => student.status !== "Inactive" && !allocations.some((allocation) => String(allocation.studentId) === String(student.id)),
    );
    const cards = [
        {
            title: "Overdue Rents",
            count: overview.payments.filter((payment) => payment.status === "Overdue").length,
            subtitle: "items",
            empty: "No overdue rents. Great job!",
            icon: AlertCircle,
            tone: "from-rose-500 to-red-600",
        },
        {
            title: "Upcoming Renewals",
            count: events.filter((event) => event.type === "Renewal" && event.date >= today).length,
            subtitle: "items",
            empty: "No renewals due this week.",
            icon: CalendarClock,
            tone: "from-amber-500 to-orange-600",
        },
        {
            title: "Follow-ups Due (Leads)",
            count: inquiries.filter((item) => ["New", "Contacted", "Visited", "Negotiating"].includes(item.status)).length,
            subtitle: "items",
            empty: "No follow-ups due today.",
            icon: UsersRound,
            tone: "from-violet-500 to-fuchsia-600",
        },
        {
            title: "Admissions Awaiting Approval",
            count: admissions.filter((item) => item.status === "Pending").length,
            subtitle: "items",
            empty: "No pending approvals.",
            icon: UserCheck,
            tone: "from-blue-500 to-indigo-600",
        },
        {
            title: "Approved Students Without a Bed",
            count: approvedWithoutBed.length,
            subtitle: "items",
            empty: "All approved students have beds assigned.",
            icon: Bed,
            tone: "from-cyan-500 to-teal-600",
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-red-600">Action Center</h1>
                        <p className="text-sm text-slate-500">Everything that needs your attention right now</p>
                    </div>
                    <div className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow">
                        {cards.reduce((total, item) => total + item.count, 0)} pending
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {cards.map(({ title, count, subtitle, empty, icon: Icon, tone }) => (
                        <div className="overflow-hidden rounded-xl bg-white shadow" key={title}>
                            <div className={`flex items-center justify-between bg-gradient-to-r ${tone} px-5 py-4 text-white`}>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-lg bg-white/20 p-2"><Icon size={22} /></span>
                                    <div>
                                        <h3 className="font-black">{title}</h3>
                                        <p className="text-xs">{count} {subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-black">{count}</p>
                            </div>
                            <div className="px-5 py-6 text-center text-sm text-slate-400">{empty}</div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ActionCenter;
