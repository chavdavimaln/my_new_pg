import React, { useMemo, useState } from "react";
import { CheckCircle, MessageCircle, Plus, XCircle } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { PageHeader, ThemePanel } from "../../Components/Layout/ThemeElements";
import { approveAdmission, getAdmissions, saveAdmissions, todayISO } from "../../Utils/pgRequirementStore";

const emptyForm = {
    name: "",
    phone: "",
    address: "",
    dob: "",
    emergencyContact: "",
    roomPreference: "",
    expectedRent: "",
    depositAmount: "",
    photoName: "",
    aadhaarName: "",
    acceptedTerms: false,
    signature: "",
};

const AdmissionManagement = () => {
    const [admissions, setAdmissions] = useState(getAdmissions());
    const [form, setForm] = useState(emptyForm);
    const stats = useMemo(
        () => ({
            pending: admissions.filter((item) => item.status === "Pending").length,
            approved: admissions.filter((item) => item.status === "Approved").length,
            rejected: admissions.filter((item) => item.status === "Rejected").length,
        }),
        [admissions],
    );

    const persist = (items) => {
        setAdmissions(items);
        saveAdmissions(items);
    };

    const submitAdmission = (event) => {
        event.preventDefault();
        if (!form.acceptedTerms) {
            alert("Student must accept Terms & Conditions before submitting.");
            return;
        }

        persist([
            ...admissions,
            {
                ...form,
                id: Date.now(),
                status: "Pending",
                createdAt: todayISO(),
                admissionLink: `https://jayambepg.local/admission/${Date.now()}`,
            },
        ]);
        setForm(emptyForm);
    };

    const updateStatus = (id, status) => {
        if (status === "Approved") approveAdmission(id);
        persist(getAdmissions().map((item) => (String(item.id) === String(id) ? { ...item, status } : item)));
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Admissions"
                    title="Student Admission System"
                    description="Create WhatsApp admission links, collect documents, approve students, and activate profiles after verification."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        ["Pending", stats.pending, "bg-amber-100 text-amber-700"],
                        ["Approved", stats.approved, "bg-emerald-100 text-emerald-700"],
                        ["Rejected", stats.rejected, "bg-red-100 text-red-700"],
                    ].map(([label, value, tone]) => (
                        <div className="pg-card p-5" key={label}>
                            <p className="text-sm font-semibold text-slate-500">{label}</p>
                            <p className={`mt-2 inline-flex rounded-lg px-3 py-1 text-2xl font-black ${tone}`}>{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <ThemePanel title="Admission Form" description="Same fields can be exposed as a public link for students.">
                        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitAdmission}>
                            {[
                                ["name", "Student name"],
                                ["phone", "Phone number"],
                                ["emergencyContact", "Emergency contact"],
                                ["dob", "DOB"],
                                ["roomPreference", "Room preference"],
                                ["expectedRent", "Rent amount"],
                                ["depositAmount", "Deposit amount"],
                                ["signature", "Digital signature"],
                            ].map(([key, label]) => (
                                <label className="text-sm font-semibold text-slate-700" key={key}>
                                    {label}
                                    <input
                                        className="pg-input mt-1"
                                        type={key === "dob" ? "date" : "text"}
                                        value={form[key]}
                                        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                                        required={["name", "phone"].includes(key)}
                                    />
                                </label>
                            ))}
                            <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
                                Address
                                <textarea
                                    className="pg-input mt-1"
                                    rows="3"
                                    value={form.address}
                                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                                />
                            </label>
                            <label className="text-sm font-semibold text-slate-700">
                                Photo upload reference
                                <input className="pg-input mt-1" value={form.photoName} onChange={(event) => setForm({ ...form, photoName: event.target.value })} placeholder="photo.jpg" />
                            </label>
                            <label className="text-sm font-semibold text-slate-700">
                                Aadhaar upload reference
                                <input className="pg-input mt-1" value={form.aadhaarName} onChange={(event) => setForm({ ...form, aadhaarName: event.target.value })} placeholder="aadhaar.pdf" />
                            </label>
                            <label className="sm:col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <input type="checkbox" checked={form.acceptedTerms} onChange={(event) => setForm({ ...form, acceptedTerms: event.target.checked })} />
                                Accept Terms & Conditions
                            </label>
                            <button className="pg-button-primary sm:col-span-2" type="submit">
                                <Plus size={18} /> Save Admission
                            </button>
                        </form>
                    </ThemePanel>

                    <ThemePanel title="Admission Requests" description="Approval creates a student profile in the imported PG data store.">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="text-slate-500">
                                    <tr>
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Room Preference</th>
                                        <th className="p-3">Documents</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admissions.map((item) => (
                                        <tr className="border-t" key={item.id}>
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                <p className="text-slate-500">{item.phone}</p>
                                            </td>
                                            <td className="p-3">{item.roomPreference || "Any"}</td>
                                            <td className="p-3">{item.photoName || "Photo pending"} / {item.aadhaarName || "Aadhaar pending"}</td>
                                            <td className="p-3"><span className="pg-badge bg-purple-100 text-purple-700">{item.status}</span></td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button className="pg-icon-button" title="Send WhatsApp link" type="button"><MessageCircle size={16} /></button>
                                                    <button className="pg-icon-button bg-emerald-600" title="Approve" type="button" onClick={() => updateStatus(item.id, "Approved")}><CheckCircle size={16} /></button>
                                                    <button className="pg-icon-button bg-red-600" title="Reject" type="button" onClick={() => updateStatus(item.id, "Rejected")}><XCircle size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ThemePanel>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdmissionManagement;
