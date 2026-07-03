import React, { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { showErrorPopup } from "../../../utils/popup";
import {
    getStoredAllocations,
    getStoredStudents,
    saveStoredAllocations,
    saveStoredStudents,
} from "../../Utils/allocationHelper";

const idProofOptions = [
    "Aadhar Card",
    "PAN Card",
    "Driving Licence",
    "Election Card",
    "Passport",
];

const emptyStudent = {
    name: "",
    photo: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    idProofType: "",
    idProofNumber: "",
    joiningDate: "",
    notes: "",
};

const StudentProfiles = () => {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState(emptyStudent);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({ query: "", idProofType: "All", month: "", year: "", sortKey: "name" });
    const allocations = getStoredAllocations();

    useEffect(() => {
        setStudents(getStoredStudents());
    }, []);

    const resetForm = () => {
        setFormData(emptyStudent);
        setEditingId(null);
    };

    const setField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setField("photo", "");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showErrorPopup("Invalid Photo", "Please select a valid image file for the profile photo.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setField("photo", reader.result || "");
        reader.readAsDataURL(file);
    };

    const saveStudent = () => {
        if (!formData.name.trim()) {
            showErrorPopup("Name Required", "Please enter the student or person name.");
            return;
        }

        if (!formData.phone.trim()) {
            showErrorPopup("Mobile Required", "Please enter a mobile number.");
            return;
        }

        if (!formData.email.trim()) {
            showErrorPopup("Email Required", "Please enter an email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            showErrorPopup("Invalid Email", "Please enter a valid email address.");
            return;
        }

        if (!formData.idProofType) {
            showErrorPopup("ID Proof Required", "Please select an ID proof type.");
            return;
        }

        if (!formData.idProofNumber.trim()) {
            showErrorPopup("ID Proof Number Required", "Please enter the selected ID proof number.");
            return;
        }

        const student = {
            id: editingId || Date.now(),
            ...formData,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            idProofType: formData.idProofType,
            idProofNumber: formData.idProofNumber.trim(),
            idProof: `${formData.idProofType} - ${formData.idProofNumber.trim()}`,
        };

        const updatedStudents = editingId
            ? students.map((item) => (item.id === editingId ? student : item))
            : [...students, student];

        if (editingId) {
            const updatedAllocations = allocations.map((allocation) =>
                String(allocation.studentId) === String(editingId)
                    ? {
                          ...allocation,
                          studentName: student.name,
                          phone: student.phone || "",
                          email: student.email || "",
                          photo: student.photo || "",
                      }
                    : allocation,
            );
            saveStoredAllocations(updatedAllocations);
        }

        saveStoredStudents(updatedStudents);
        setStudents(updatedStudents);
        resetForm();
    };

    const editStudent = (student) => {
        setEditingId(student.id);
        setFormData({
            name: student.name || "",
            photo: student.photo || "",
            phone: student.phone || "",
            email: student.email || "",
            address: student.address || "",
            emergencyContact: student.emergencyContact || student.guardianName || "",
            idProofType: student.idProofType || "",
            idProofNumber: student.idProofNumber || student.idProof || "",
            joiningDate: student.joiningDate || "",
            notes: student.notes || "",
        });
    };

    const deleteStudent = (id) => {
        const hasAllocation = allocations.some((allocation) => String(allocation.studentId) === String(id));
        if (hasAllocation) {
            showErrorPopup(
                "Profile In Use",
                "This profile is used in an allocation. Delete or change the allocation first.",
            );
            return;
        }

        const updatedStudents = students.filter((student) => student.id !== id);
        saveStoredStudents(updatedStudents);
        setStudents(updatedStudents);

        if (editingId === id) resetForm();
    };

    const profileColumns = [
        {
            key: "photo",
            header: "Photo",
            sortValue: (student) => student.name || "",
            render: (student) =>
                student.photo ? (
                    <img
                        src={student.photo}
                        alt={student.name || "Profile"}
                        className="h-10 w-10 rounded object-cover"
                    />
                ) : (
                    "-"
                ),
        },
        { key: "name", header: "Name", accessor: "name" },
        { key: "phone", header: "Mobile", sortValue: (student) => student.phone || "-", render: (student) => student.phone || "-" },
        { key: "email", header: "Email", sortValue: (student) => student.email || "-", render: (student) => student.email || "-" },
        {
            key: "emergencyContact",
            header: "Emergency",
            sortValue: (student) => student.emergencyContact || student.guardianName || "-",
            render: (student) => student.emergencyContact || student.guardianName || "-",
        },
        {
            key: "idProof",
            header: "ID Proof",
            sortValue: (student) => student.idProof || student.idProofNumber || "-",
            render: (student) => student.idProof || student.idProofNumber || "-",
        },
        {
            key: "action",
            header: "Action",
            sortable: false,
            searchable: false,
            render: (student) => (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => editStudent(student)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                        title="Edit profile"
                        aria-label="Edit profile"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteStudent(student.id)}
                        className="flex h-9 w-9 items-center justify-center rounded bg-red-600 text-white"
                        title="Delete profile"
                        aria-label="Delete profile"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filteredStudents = students
        .filter((student) => filters.idProofType === "All" || student.idProofType === filters.idProofType)
        .filter((student) => !filters.month || String(student.joiningDate || "").slice(5, 7) === filters.month)
        .filter((student) => !filters.year || String(student.joiningDate || "").slice(0, 4) === filters.year)
        .filter((student) => `${student.name} ${student.phone} ${student.email} ${student.address} ${student.idProofType} ${student.idProofNumber} ${student.joiningDate}`.toLowerCase().includes(filters.query.toLowerCase()))
        .sort((a, b) => String(a[filters.sortKey] || "").localeCompare(String(b[filters.sortKey] || ""), undefined, { numeric: true }));

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Student / Person Profiles</h1>

                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-left mb-2 block font-medium">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setField("name", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-left mb-2 block font-medium">Photo</label>
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                {formData.photo ? (
                                    <img
                                        src={formData.photo}
                                        alt="Profile preview"
                                        className="h-12 w-12 rounded object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                                        Photo
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="min-w-0 flex-1 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-left mb-2 block font-medium">Mobile *</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setField("phone", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-left mb-2 block font-medium">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setField("email", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-left mb-2 block font-medium">Emergency Contact</label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => setField("emergencyContact", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-left mb-2 block font-medium">ID Proof *</label>
                            <select
                                value={formData.idProofType}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        idProofType: e.target.value,
                                        idProofNumber: "",
                                    }))
                                }
                                className="w-full border p-3 rounded-lg"
                                required
                            >
                                <option value="">Select ID Proof</option>
                                {idProofOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formData.idProofType && (
                            <div>
                                <label className="text-left mb-2 block font-medium">{formData.idProofType} Number *</label>
                                <input
                                    type="text"
                                    value={formData.idProofNumber}
                                    onChange={(e) => setField("idProofNumber", e.target.value)}
                                    className="w-full border p-3 rounded-lg"
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-left mb-2 block font-medium">Joining Date</label>
                            <input
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) => setField("joiningDate", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-left mb-2 block font-medium">Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setField("address", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-left mb-2 block font-medium">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setField("notes", e.target.value)}
                                className="w-full border p-3 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={saveStudent}
                            className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600 text-white"
                            title={editingId ? "Update profile" : "Add profile"}
                            aria-label={editingId ? "Update profile" : "Add profile"}
                        >
                            <Check className="h-5 w-5" />
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-600 text-white"
                                title="Cancel edit"
                                aria-label="Cancel edit"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">Profile List</h2>
                    <div className="mb-4 grid gap-3 md:grid-cols-5">
                        <input className="pg-input" placeholder="Search name, phone, ID..." value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} />
                        <select className="pg-input" value={filters.idProofType} onChange={(event) => setFilters({ ...filters, idProofType: event.target.value })}>
                            <option>All</option>
                            {idProofOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                        <input className="pg-input" placeholder="Month MM" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value.padStart(2, "0").slice(-2) })} />
                        <input className="pg-input" placeholder="Year YYYY" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })} />
                        <select className="pg-input" value={filters.sortKey} onChange={(event) => setFilters({ ...filters, sortKey: event.target.value })}>
                            <option value="name">Sort by name</option>
                            <option value="phone">Sort by mobile</option>
                            <option value="email">Sort by email</option>
                            <option value="joiningDate">Sort by joining date</option>
                            <option value="idProofType">Sort by ID proof</option>
                        </select>
                    </div>
                    <ResponsiveSortableTable
                        columns={profileColumns}
                        rows={filteredStudents}
                        rowKey={(student) => student.id}
                        searchPlaceholder="Search profiles..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default StudentProfiles;
