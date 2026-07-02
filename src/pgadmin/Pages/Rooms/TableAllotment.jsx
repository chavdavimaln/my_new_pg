// src/Pages/Rooms/TableAllotment.jsx

import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getStoredAllocations } from "../../Utils/allocationHelper";

const TableAllotment = () => {

    const allocations = getStoredAllocations().filter(item => item.tableId);
    const columns = [
        { key: "studentName", header: "Student", accessor: "studentName" },
        { key: "roomNumber", header: "Room", accessor: "roomNumber" },
        {
            key: "table",
            header: "Table",
            sortValue: (item) => item.tableLabel || item.tableId,
            render: (item) => item.tableLabel || item.tableId,
        },
    ];

    return (
        <AdminLayout>
            <div className="bg-white p-6 rounded-xl shadow">

                <h1 className="text-2xl font-bold mb-5">
                    Table Allotment
                </h1>

                <ResponsiveSortableTable
                    columns={columns}
                    rows={allocations}
                    rowKey={(item) => item.id}
                    searchPlaceholder="Search table allotments..."
                />

            </div>
        </AdminLayout>
    );
};

export default TableAllotment;
