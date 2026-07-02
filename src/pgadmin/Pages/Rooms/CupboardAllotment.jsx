// src/Pages/Rooms/CupboardAllotment.jsx

import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations } from "../../Utils/allocationHelper";

const CupboardAllotment = () => {

    const allocations = getStoredAllocations().filter(item => item.cupboardId);
    const columns = [
        { key: "studentName", header: "Student", accessor: "studentName" },
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        {
            key: "cupboard",
            header: "Cupboard",
            sortValue: (item) => item.cupboardLabel || item.cupboardId,
            render: (item) => item.cupboardLabel || item.cupboardId,
        },
    ];

    return (
        <AdminLayout>
            <div className="bg-white p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold mb-5">
                    Cupboard Allotment
                </h1>
                <ResponsiveSortableTable
                    columns={columns}
                    rows={allocations}
                    rowKey={(item) => item.id}
                    searchPlaceholder="Search cupboard allotments..."
                />
            </div>
        </AdminLayout>
    );
};

export default CupboardAllotment;
