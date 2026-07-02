// pgadmin/src/Pages/Dashboard/Dashboard.jsx

import React from "react";
import { Bed, DoorOpen, Home, UserCheck, Users, Warehouse } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, StatCard, ThemePanel } from "../../Components/Layout/ThemeElements";
import { getStoredAllocations, getStoredRooms, getStoredStudents } from "../../Utils/allocationHelper";
import { getPgOverview } from "../../Utils/pgRequirementStore";
import { PG_BRAND } from "../../Utils/pgBrand";

const Dashboard = () => {
    const rooms = getStoredRooms();
    const allocations = getStoredAllocations();
    const students = getStoredStudents();
    const overview = getPgOverview();

    // These totals are derived from the saved room layouts so the dashboard stays in sync with room designer edits.
    const totalBeds = rooms.reduce((total, room) => total + (room.beds?.length || 0), 0);
    const occupiedBeds = allocations.filter((allocation) => allocation.bedId).length;
    const totalTables = rooms.reduce((total, room) => total + (room.tables?.length || 0), 0);
    const totalCupboards = rooms.reduce((total, room) => total + (room.cupboards?.length || 0), 0);
    const totalDoors = rooms.reduce((total, room) => total + (room.doors?.length || 0), 0);
    const occupiedRooms = new Set(allocations.map((allocation) => String(allocation.roomId))).size;

    const cards = [
        { title: "Rooms", value: rooms.length, detail: `${occupiedRooms} occupied`, icon: Home, tone: "primary" },
        { title: "Students", value: students.length, detail: `${allocations.length} allotments`, icon: Users, tone: "info" },
        { title: "Beds", value: totalBeds, detail: `${Math.max(totalBeds - occupiedBeds, 0)} vacant`, icon: Bed, tone: "success" },
        { title: "Pending Payments", value: overview.pendingPayments, detail: overview.incomeLabel, icon: UserCheck, tone: "warning" },
        { title: "Tables", value: totalTables, detail: `${allocations.filter((item) => item.tableId).length} allotted`, icon: UserCheck, tone: "warning" },
        {
            title: "Cupboards",
            value: totalCupboards,
            detail: `${allocations.filter((item) => item.cupboardId).length} allotted`,
            icon: Warehouse,
            tone: "success",
        },
        { title: "Doors", value: totalDoors, detail: "room entries", icon: DoorOpen, tone: "slate" },
    ];

    const recentAllocations = allocations.slice(-5).reverse();

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Overview"
                    title={`${PG_BRAND.name} Dashboard`}
                    description="Track rooms, students, beds, payments, expenses, profit, reminders, and recent allotments."
                />

                {/* Dashboard stats section: reuse StatCard for any future KPI count. */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <ThemePanel title="Financial Snapshot" description="Monthly income, expenses, net profit, and pending payments.">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-700">Monthly Income</p>
                                <p className="mt-1 text-xl font-black text-emerald-800">{overview.incomeLabel}</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-700">Total Expenses</p>
                                <p className="mt-1 text-xl font-black text-red-800">{overview.expensesLabel}</p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-4">
                                <p className="text-sm font-semibold text-purple-700">Net Profit</p>
                                <p className="mt-1 text-xl font-black text-purple-800">{overview.profitLabel}</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-4">
                                <p className="text-sm font-semibold text-amber-700">Upcoming Renewals</p>
                                <p className="mt-1 text-xl font-black text-amber-800">{overview.upcomingRenewals}</p>
                            </div>
                        </div>
                    </ThemePanel>

                    <ThemePanel title="Recent Allotments" description="Latest saved student room allocations.">
                        <ul className="space-y-3">
                            {recentAllocations.length > 0 ? (
                                recentAllocations.map((allocation) => (
                                    <li key={allocation.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                        <p className="font-semibold text-slate-900">{allocation.studentName}</p>
                                        <p className="text-sm text-slate-500">
                                            Room {allocation.roomNumber} - {allocation.bedLabel || allocation.bedId}
                                        </p>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-500">No allotments yet.</li>
                            )}
                        </ul>
                    </ThemePanel>

                    <ThemePanel title="Occupancy" description="Live occupancy based on local storage allocations.">
                        {/* Progress section: width values are calculated above, the style prop only renders the percentage. */}
                        <div className="space-y-4">
                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span>Beds Occupied</span>
                                    <span>
                                        {occupiedBeds}/{totalBeds || 0}
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-3 rounded-full"
                                        style={{
                                            width: `${totalBeds ? (occupiedBeds / totalBeds) * 100 : 0}%`,
                                            background: "var(--pg-primary)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex justify-between">
                                    <span>Rooms Occupied</span>
                                    <span>
                                        {occupiedRooms}/{rooms.length || 0}
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-3 rounded-full bg-emerald-600"
                                        style={{ width: `${rooms.length ? (occupiedRooms / rooms.length) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </ThemePanel>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
