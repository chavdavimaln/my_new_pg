// src/Pages/Rooms/OccupiedRooms.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations, getStoredRooms } from "../../Utils/allocationHelper";
import { pgPath } from "../../Utils/pgBrand";

const OccupiedRooms = () => {
    const rooms = getStoredRooms();
    const allocations = getStoredAllocations();

    const occupiedRows = allocations.map((allocation) => {
        const room = rooms.find((item) => String(item.id) === String(allocation.roomId));
        return {
            ...allocation,
            roomType: allocation.roomType || room?.roomType || "-",
            roomNumber: allocation.roomNumber || room?.roomNumber || "-",
        };
    });
    const columns = [
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        { key: "roomType", header: "Type", accessor: "roomType" },
        { key: "bed", header: "Bed", sortValue: (item) => item.bedLabel || item.bedId },
        { key: "table", header: "Table", sortValue: (item) => item.tableLabel || "-" },
        { key: "cupboard", header: "Cupboard", sortValue: (item) => item.cupboardLabel || "-" },
        { key: "studentName", header: "Student / Person", accessor: "studentName" },
        { key: "phone", header: "Phone", sortValue: (item) => item.phone || "-" },
        {
            key: "action",
            header: "Action",
            sortable: false,
            searchable: false,
            render: (item) => (
                <Link
                    to={pgPath(`/student-allocation?allocationId=${item.id}`)}
                    className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                    title="Edit allocation"
                    aria-label="Edit allocation"
                >
                    <Pencil className="h-4 w-4" />
                </Link>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold mb-5">Occupied Rooms</h1>

                <ResponsiveSortableTable
                    columns={columns}
                    rows={occupiedRows}
                    rowKey={(item) => item.id}
                    searchPlaceholder="Search occupied rooms..."
                />
            </div>
        </AdminLayout>
    );
};

export default OccupiedRooms;
