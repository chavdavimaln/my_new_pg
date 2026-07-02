import React, { useState } from "react";
const RoomForm = () => {
    const [form, setForm] = useState({
        roomNo: "",
        roomName: "",
        roomType: "",
        totalBeds: 2,
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <div className="grid md:grid-cols-2 gap-5">
                <div>
                    <label className="block mb-2 font-medium">Room Number</label>
                    <input
                        type="text"
                        value={form.roomNo}
                        onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
                        placeholder="Enter Room Number"
                        className="w-full border rounded-lg p-3"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Room Name</label>

                    <input
                        type="text"
                        value={form.roomName}
                        onChange={(e) => setForm({ ...form, roomName: e.target.value })}
                        placeholder="Enter Room Name"
                        className="w-full border rounded-lg p-3"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Room Type</label>

                    <select
                        value={form.roomType}
                        onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                        className="w-full border rounded-lg p-3"
                    >
                        <option value="">Select Room Type</option>
                        <option value="Single Room">Single Room</option>
                        <option value="Twin Room">Twin Room</option>
                        <option value="Triple Room">Triple Room</option>

                        <option value="Quad Room">Quad Room</option>

                        <option value="Common Room">Common Room</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-2 font-medium">Total Beds</label>
                    <input
                        type="number"
                        min="1"
                        max="6"
                        value={form.totalBeds}
                        onChange={(e) => setForm({ ...form, totalBeds: e.target.value })}
                        className="w-full border rounded-lg p-3"
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomForm;
