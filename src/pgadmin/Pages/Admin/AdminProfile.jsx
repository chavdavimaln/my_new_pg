import React from "react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { getAdminUsers, getCurrentAdmin, isSuperAdmin } from "../../Utils/adminAuth";

const AdminProfile = () => {
    const currentAdmin = getCurrentAdmin();
    const admins = getAdminUsers();
    const visibleAdmins = isSuperAdmin(currentAdmin)
        ? admins
        : admins.filter((admin) => admin.id === currentAdmin?.id || admin.role !== "super-admin");

    const columns = [
        { key: "name", header: "Name", accessor: "name" },
        { key: "username", header: "Username", accessor: "username" },
        { key: "email", header: "Email", sortValue: (admin) => admin.email || "-", render: (admin) => admin.email || "-" },
        { key: "role", header: "Role", accessor: "role" },
        {
            key: "status",
            header: "Status",
            sortValue: (admin) => (admin.active === false ? "Inactive" : "Active"),
            render: (admin) => (admin.active === false ? "Inactive" : "Active"),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 text-left shadow">
                    <h1 className="text-2xl font-bold">Administration Profile</h1>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{currentAdmin?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">{currentAdmin?.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{currentAdmin?.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium">{currentAdmin?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 text-left shadow">
                    <h2 className="mb-4 text-xl font-bold">Admin Persons</h2>
                    <ResponsiveSortableTable
                        columns={columns}
                        rows={visibleAdmins}
                        rowKey={(admin) => admin.id}
                        searchPlaceholder="Search admin persons..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
