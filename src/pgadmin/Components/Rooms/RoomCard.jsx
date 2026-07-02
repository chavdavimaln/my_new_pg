// pgadmin/src/Components/Rooms/RoomCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Bed, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../Layout/ThemeElements";
import { pgPath } from "../../Utils/pgBrand";

const RoomCard = ({ room, onDelete }) => {
    const listItems = (items) => (items.length ? items.join(", ") : "-");
    const statusTone = {
        Occupied: "danger",
        "Partially Occupied": "warning",
        "Under Maintenance": "slate",
        Available: "success",
    }[room.status] || "success";

    return (
        // Room card section: reused by room grids, keep room display rules in this component.
        <div className="room-card pg-card pg-card-hover flex h-full flex-col p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="break-words text-lg font-bold text-slate-950">Room {room.roomNumber}</h3>
                    <p className="mt-1 text-sm text-slate-500">{room.roomType}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                    <Bed className="h-5 w-5" />
                </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">Beds: {room.beds?.length || 0}</p>
            <div className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
                <p className="break-words">Occupied Beds: {listItems(room.occupiedBeds || [])}</p>
                <p className="break-words">Occupied Tables: {listItems(room.occupiedTables || [])}</p>
                <p className="break-words">Occupied Cupboards: {listItems(room.occupiedCupboards || [])}</p>
            </div>
            <div className="mt-4">
                <StatusBadge tone={statusTone}>{room.status}</StatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Link
                    to={pgPath(`/rooms/designer/${room.id}`)}
                    className="pg-icon-button"
                    title="Edit room"
                    aria-label="Edit room"
                >
                    <Pencil className="h-4 w-4" />
                </Link>
                <button
                    type="button"
                    onClick={() => onDelete(room)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700"
                    title="Delete room"
                    aria-label="Delete room"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default RoomCard;
