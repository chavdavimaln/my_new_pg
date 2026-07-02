// pgadmin/src/Components/Rooms/RoomToolbar.jsx

import React from "react";
import { Archive, BedDouble, DoorOpen, Plus, RotateCw, Table2, Trash2 } from "lucide-react";

const RoomToolbar = ({
    addBed,
    addTable,
    addCupboard,
    deleteSelectedItem,
    bedCount,
    tableCount,
    cupboardCount,
    rotateSelectedItem,
    addDoor,
    doorCount,
    selectedItem,
}) => {
    const addButtonClass =
        "flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400";
    const iconButtonClass =
        "flex h-11 w-11 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:bg-gray-400";

    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={addBed}
                    disabled={bedCount >= 6}
                    className={addButtonClass}
                    title="Add bed"
                    aria-label="Add bed"
                >
                    <BedDouble className="h-5 w-5" />
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">{bedCount}</span>
                </button>

                <button
                    type="button"
                    onClick={addTable}
                    disabled={tableCount >= 6}
                    className={addButtonClass}
                    title="Add table"
                    aria-label="Add table"
                >
                    <Table2 className="h-5 w-5" />
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">{tableCount}</span>
                </button>

                <button
                    type="button"
                    onClick={addCupboard}
                    disabled={cupboardCount >= 6}
                    className={addButtonClass}
                    title="Add cupboard"
                    aria-label="Add cupboard"
                >
                    <Archive className="h-5 w-5" />
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">{cupboardCount}</span>
                </button>

                <button
                    type="button"
                    onClick={rotateSelectedItem}
                    disabled={!selectedItem}
                    className={`${iconButtonClass} bg-gray-400 hover:bg-gray-500`}
                    title="Rotate selected item"
                    aria-label="Rotate selected item"
                >
                    <RotateCw className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={addDoor}
                    className="flex h-11 items-center gap-2 rounded-lg bg-gray-700 px-4 text-white transition hover:bg-gray-800"
                    title={doorCount > 0 ? "Select door" : "Add door"}
                    aria-label={doorCount > 0 ? "Select door" : "Add door"}
                >
                    <DoorOpen className="h-5 w-5" />
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">{doorCount}</span>
                </button>

                {selectedItem && selectedItem.type !== "door" && (
                    <button
                        type="button"
                        onClick={deleteSelectedItem}
                        className={`${iconButtonClass} bg-red-700 hover:bg-red-800`}
                        title="Delete selected item"
                        aria-label="Delete selected item"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomToolbar;
