import React, { useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { ThemePanel } from "../../Components/Layout/ThemeElements";
import { getStoredAllocations, getStoredRooms } from "../../Utils/allocationHelper";
import {
    getBuildings,
    getRoomPropertyAssignments,
    saveBuildings,
    saveRoomPropertyAssignments,
} from "../../Utils/pgRequirementStore";
import { pgPath } from "../../Utils/pgBrand";

const PropertyManagement = () => {
    const initialBuildings = getBuildings();
    const [buildings, setBuildings] = useState(initialBuildings);
    const [activeBuildingId, setActiveBuildingId] = useState(initialBuildings[0]?.id || "");
    const [form, setForm] = useState({ name: "", address: "", floors: 1 });
    const [floorName, setFloorName] = useState("");
    const [editingFloorId, setEditingFloorId] = useState("");
    const [roomAssignments, setRoomAssignments] = useState(getRoomPropertyAssignments());
    const rooms = getStoredRooms();
    const allocations = getStoredAllocations();

    const activeBuilding = buildings.find((building) => String(building.id) === String(activeBuildingId)) || buildings[0];

    const addBuilding = (event) => {
        event.preventDefault();
        const floors = Array.from({ length: Number(form.floors || 1) }, (_, index) => ({
            id: `${Date.now()}-floor-${index}`,
            name: index === 0 ? "Ground Floor" : `Floor ${index + 1}`,
            level: index,
        }));
        const nextBuilding = { ...form, id: Date.now(), floors: floors.length, floorsList: floors };
        const next = [...buildings, nextBuilding];
        setBuildings(next);
        saveBuildings(next);
        setActiveBuildingId(nextBuilding.id);
        setForm({ name: "", address: "", floors: 1 });
    };

    const saveFloor = () => {
        if (!floorName.trim()) return;
        const next = buildings.map((building) =>
            String(building.id) === String(activeBuilding?.id)
                ? {
                      ...building,
                      floorsList: editingFloorId
                          ? (building.floorsList || []).map((floor) =>
                                String(floor.id) === String(editingFloorId) ? { ...floor, name: floorName.trim() } : floor,
                            )
                          : [
                                ...(building.floorsList || []),
                                {
                                    id: `${building.id}-floor-${Date.now()}`,
                                    name: floorName.trim(),
                                    level: (building.floorsList || []).length,
                                },
                            ],
                      floors: editingFloorId ? building.floors : (building.floorsList || []).length + 1,
                  }
                : building,
        );
        setBuildings(next);
        saveBuildings(next);
        setFloorName("");
        setEditingFloorId("");
    };

    const editFloor = (floor) => {
        setFloorName(floor.name);
        setEditingFloorId(floor.id);
    };

    const deleteFloor = (floorId) => {
        const next = buildings.map((building) =>
            String(building.id) === String(activeBuilding?.id)
                ? {
                      ...building,
                      floorsList: (building.floorsList || []).filter((floor) => String(floor.id) !== String(floorId)),
                      floors: Math.max((building.floorsList || []).length - 1, 0),
                  }
                : building,
        );
        setBuildings(next);
        saveBuildings(next);
    };

    const updateRoomAssignment = (roomId, key, value) => {
        const current = roomAssignments[roomId] || {};
        const nextAssignments = {
            ...roomAssignments,
            [roomId]: {
                ...current,
                [key]: value,
            },
        };
        setRoomAssignments(nextAssignments);
        saveRoomPropertyAssignments(nextAssignments);
    };

    const getAssignedBuilding = (room) => {
        const assignment = roomAssignments[room.id] || {};
        return buildings.find((building) => String(building.id) === String(assignment.buildingId)) || activeBuilding || buildings[0];
    };

    const bedStatus = (room, bed) => {
        const allocation = allocations.find((item) => String(item.roomId) === String(room.id) && String(item.bedId) === String(bed.id));
        if (allocation?.paymentStatus === "Pending") return "Payment pending";
        if (allocation) return "Occupied";
        if (bed.status === "Reserved") return "Reserved";
        return "Available";
    };

    const statusClass = {
        Available: "bg-emerald-500",
        Occupied: "bg-red-500",
        "Payment pending": "bg-amber-400",
        Reserved: "bg-blue-500",
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-violet-700">Properties</h1>
                        <p className="text-sm text-slate-500">Buildings, floors, rooms & beds</p>
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <ThemePanel title="Add Building" description="Use this for PG blocks and library blocks.">
                        <form className="grid gap-3 sm:grid-cols-2" onSubmit={addBuilding}>
                            <input className="pg-input" placeholder="Building name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                            <input className="pg-input" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
                            <input className="pg-input" type="number" min="1" placeholder="Number of floors" value={form.floors} onChange={(event) => setForm({ ...form, floors: event.target.value })} />
                            <button className="pg-button-primary" type="submit"><Plus size={18} /> Add Building</button>
                        </form>
                    </ThemePanel>

                    <ThemePanel title="Buildings" description="Select the building currently being allocated.">
                        <div className="flex flex-wrap gap-2">
                            {buildings.map((building) => (
                                <button
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${String(activeBuilding?.id) === String(building.id) ? "bg-violet-600 text-white shadow" : "border bg-white text-violet-700"}`}
                                    key={building.id}
                                    onClick={() => setActiveBuildingId(building.id)}
                                    type="button"
                                >
                                    <Building2 size={16} />
                                    {building.name}
                                </button>
                            ))}
                        </div>
                    </ThemePanel>
                </div>

                <ThemePanel title="Floors" description={`Floor list for ${activeBuilding?.name || "selected building"}.`}>
                    <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input className="pg-input" placeholder="Floor name" value={floorName} onChange={(event) => setFloorName(event.target.value)} />
                        <button className="rounded-lg border bg-white px-4 py-2 text-sm font-bold shadow-sm" type="button" onClick={saveFloor}>
                            <Plus size={16} className="inline" /> {editingFloorId ? "Update Floor" : "Add Floor"}
                        </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {(activeBuilding?.floorsList || []).map((floor) => (
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700" key={floor.id}>
                                <span>{floor.name}</span>
                                <span className="flex gap-2">
                                    <button type="button" onClick={() => editFloor(floor)} title="Edit floor"><Pencil size={15} /></button>
                                    <button type="button" onClick={() => deleteFloor(floor.id)} title="Delete floor"><Trash2 size={15} /></button>
                                </span>
                            </div>
                        ))}
                    </div>
                </ThemePanel>

                <ThemePanel title="Rooms & Beds" description="Click designer to assign, transfer, or vacate. Room cards show building allocation.">
                    <div className="mb-4 flex flex-wrap gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                        {Object.entries(statusClass).map(([label, color]) => <span className="flex items-center gap-2" key={label}><span className={`h-3 w-3 rounded ${color}`} /> {label}</span>)}
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                        {rooms.map((room) => {
                            const assignedBuilding = getAssignedBuilding(room);
                            const assignedFloor = roomAssignments[room.id]?.floor || assignedBuilding?.floorsList?.[0]?.name || "Ground Floor";
                            return (
                            <div className="rounded-xl border bg-white p-4" key={room.id}>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-lg font-black text-slate-900">Room {room.roomNumber}</p>
                                        <p className="text-sm text-slate-500">{assignedBuilding?.name || "Building A"} - {assignedFloor}</p>
                                        <p className="text-sm text-slate-500">{room.beds?.length || room.bedCount || 0} beds - Rent {room.rentPrice || room.rent || "not set"}</p>
                                    </div>
                                    <Link className="pg-button-primary py-2" to={pgPath(`/rooms/designer/${room.id}`)}>Designer</Link>
                                </div>
                                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                                    <label className="text-xs font-bold text-slate-500">
                                        Building / Library Block
                                        <select
                                            className="pg-input mt-1 py-2"
                                            value={roomAssignments[room.id]?.buildingId || assignedBuilding?.id || ""}
                                            onChange={(event) => updateRoomAssignment(room.id, "buildingId", event.target.value)}
                                        >
                                            {buildings.map((building) => (
                                                <option key={building.id} value={building.id}>{building.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="text-xs font-bold text-slate-500">
                                        Floor
                                        <select
                                            className="pg-input mt-1 py-2"
                                            value={roomAssignments[room.id]?.floor || "Ground Floor"}
                                            onChange={(event) => updateRoomAssignment(room.id, "floor", event.target.value)}
                                        >
                                            {(assignedBuilding?.floorsList || []).map((floor) => (
                                                <option key={floor.id} value={floor.name}>{floor.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {(room.beds || []).map((bed, index) => {
                                        const status = bedStatus(room, bed);
                                        return <span className={`rounded-lg px-3 py-4 text-center text-sm font-bold text-white ${statusClass[status]}`} key={bed.id}>Bed {bed.label || index + 1}<br />{status.toLowerCase()}</span>;
                                    })}
                                </div>
                            </div>
                        )})}
                        {!rooms.length && <p className="text-slate-500">No rooms yet. Use Add Room from the Rooms tools or imported room designer.</p>}
                    </div>
                </ThemePanel>
            </div>
        </AdminLayout>
    );
};

export default PropertyManagement;
