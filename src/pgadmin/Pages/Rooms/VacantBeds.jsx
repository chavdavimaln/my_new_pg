// src/Pages/Rooms/VacantBeds.jsx

import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations, getStoredRooms, getVacantBedsForRoom } from "../../Utils/allocationHelper";

const VacantBeds = () => {

    const rooms = getStoredRooms();
    const allocations = getStoredAllocations();

    const vacantBeds = [];

    rooms.forEach(room => {
        getVacantBedsForRoom(room, allocations).forEach(bed => {
            vacantBeds.push({
                roomNumber:
                    room.roomNumber,
                bedLabel:
                    bed.label
            });
        });
    });
    const columns = [
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        { key: "bedLabel", header: "Bed", accessor: "bedLabel" },
    ];

    return (
        <AdminLayout>

            <div className="bg-white p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold mb-5">
                    Vacant Beds
                </h1>
                <ResponsiveSortableTable
                    columns={columns}
                    rows={vacantBeds}
                    rowKey={(bed, index) => `${bed.roomNumber}-${bed.bedLabel}-${index}`}
                    searchPlaceholder="Search vacant beds..."
                />

            </div>

        </AdminLayout>
    );
};

export default VacantBeds;
