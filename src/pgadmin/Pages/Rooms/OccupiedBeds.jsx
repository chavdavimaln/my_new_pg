// src/Pages/Rooms/OccupiedBeds.jsx

import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations } from "../../Utils/allocationHelper";

const OccupiedBeds = () => {

    const allocations = getStoredAllocations();
    const columns = [
        { key: "studentName", header: "Student", accessor: "studentName" },
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        { key: "bed", header: "Bed", sortValue: (item) => item.bedLabel || item.bedId, render: (item) => item.bedLabel || item.bedId },
    ];

    return (
        <AdminLayout>
            <div className="bg-white p-6 rounded-xl shadow">

                <h1 className="text-2xl font-bold mb-5">
                    Occupied Beds
                </h1>
                <ResponsiveSortableTable
                    columns={columns}
                    rows={allocations}
                    rowKey={(item) => item.id}
                    searchPlaceholder="Search occupied beds..."
                />
            </div>
        </AdminLayout>
    );
};

export default OccupiedBeds;
