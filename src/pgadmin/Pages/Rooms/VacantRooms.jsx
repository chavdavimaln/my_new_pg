// src/Pages/Rooms/VacantRooms.jsx

import React from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import {
    getStoredAllocations,
    getStoredRooms,
    getVacantBedsForRoom,
    isRoomUnderMaintenance,
    isOccupied,
} from "../../Utils/allocationHelper";
import { pgPath } from "../../Utils/pgBrand";

const VacantRooms = () => {
    const rooms = getStoredRooms();
    const allocations = getStoredAllocations();

    const vacantRooms = rooms
        .filter((room) => !isRoomUnderMaintenance(room))
        .map((room) => {
            const vacantBeds = getVacantBedsForRoom(room, allocations);
            const vacantTables = (room.tables || []).filter((table) => !isOccupied("table", table.id, room.id));
            const vacantCupboards = (room.cupboards || []).filter(
                (cupboard) => !isOccupied("cupboard", cupboard.id, room.id),
            );

            return {
                room,
                vacantBeds,
                vacantTables,
                vacantCupboards,
            };
        })
        .filter((item) => item.vacantBeds.length > 0);

    const columns = [
        { key: "roomNumber", header: "Room No", sortValue: ({ room }) => room.roomNumber, render: ({ room }) => room.roomNumber },
        { key: "roomType", header: "Type", sortValue: ({ room }) => room.roomType, render: ({ room }) => room.roomType },
        {
            key: "beds",
            header: "Vacant Beds",
            sortValue: ({ vacantBeds }) => vacantBeds.map((bed) => bed.label).join(", "),
            render: ({ vacantBeds }) => vacantBeds.map((bed) => bed.label).join(", "),
        },
        {
            key: "tables",
            header: "Vacant Tables",
            sortValue: ({ vacantTables }) => vacantTables.map((table) => table.label).join(", ") || "-",
            render: ({ vacantTables }) => vacantTables.map((table) => table.label).join(", ") || "-",
        },
        {
            key: "cupboards",
            header: "Vacant Cupboards",
            sortValue: ({ vacantCupboards }) => vacantCupboards.map((cupboard) => cupboard.label).join(", ") || "-",
            render: ({ vacantCupboards }) => vacantCupboards.map((cupboard) => cupboard.label).join(", ") || "-",
        },
        {
            key: "allocate",
            header: "Allocate",
            sortable: false,
            searchable: false,
            render: ({ room, vacantBeds }) => (
                <div className="flex flex-wrap gap-2">
                    {vacantBeds.map((bed) => (
                        <Link
                            key={bed.id}
                            to={pgPath(`/student-allocation?roomId=${room.id}&bedId=${bed.id}`)}
                            className="flex h-9 w-9 items-center justify-center rounded bg-green-600 text-white"
                            title={`Allocate ${bed.label}`}
                            aria-label={`Allocate ${bed.label}`}
                        >
                            <UserPlus className="h-4 w-4" />
                        </Link>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold mb-5">Vacant Rooms</h1>

                <ResponsiveSortableTable
                    columns={columns}
                    rows={vacantRooms}
                    rowKey={({ room }) => room.id}
                    searchPlaceholder="Search vacant rooms..."
                />
            </div>
        </AdminLayout>
    );
};

export default VacantRooms;
