// pgadmin/src/Pages/Rooms/RoomAdd.jsx
import React, { useMemo, useState } from "react";
import { Archive, BedDouble, DoorOpen, Plus, RotateCw, Table2, Trash2 } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import RoomCanvas from "../../Components/Rooms/RoomCanvas";
import {
    CANVAS_PADDING,
    DEFAULT_SIZES,
    getRoomItemSize,
    snapRoomItemPosition,
} from "../../Utils/roomLayoutEngine";
import { getRotatedSize, GRID_SIZE } from "../../Utils/gridConfig";
import { getStoredRooms, saveStoredRooms } from "../../Utils/allocationHelper";
import { getBuildings } from "../../Utils/pgRequirementStore";

const FEET_TO_PX = 75;
const DEFAULT_ROOM_FEET = {
    width: 10,
    height: 8,
};

const getRoomType = (beds) => {
    if (beds === 1) return "Single Room";
    if (beds === 2) return "Twin Room";
    if (beds === 3) return "Triple Room";
    if (beds === 4) return "Quad Room";
    if (beds >= 5) return "Common Room";
    return "Room";
};

const generateRoomName = () => {
    const rooms = getStoredRooms();

    return `R-${String(rooms.length + 1).padStart(3, "0")}`;
}; 

const createRoomId = () => `room-${Date.now()}`;

const getCanvasPixels = (feet) => Math.max(1, Number(feet) || 1) * FEET_TO_PX;

const getDefaultDoor = (canvasWidth, canvasHeight) => ({
    id: "door-1",
    label: "Door",
    x: 0,
    y: Math.max(0, canvasHeight - DEFAULT_SIZES.door.height),
    ...DEFAULT_SIZES.door,
    rotation: 0, 
});

const RoomAdd = () => {
    const buildings = getBuildings();
    const defaultBuilding = buildings[0] || { id: "", name: "", floorsList: [] };
    const defaultFloor = defaultBuilding.floorsList?.[0] || { id: "", name: "" };
    const initialCanvasWidth = getCanvasPixels(DEFAULT_ROOM_FEET.width);
    const initialCanvasHeight = getCanvasPixels(DEFAULT_ROOM_FEET.height);
    const [roomId, setRoomId] = useState(createRoomId());
    const [roomData, setRoomData] = useState({
        roomNumber: generateRoomName(),
        widthFeet: DEFAULT_ROOM_FEET.width,
        heightFeet: DEFAULT_ROOM_FEET.height,
        status: "Available",
        buildingId: defaultBuilding.id,
        buildingName: defaultBuilding.name,
        floorId: defaultFloor.id,
        floorName: defaultFloor.name,
    });

    const canvasWidth = useMemo(() => getCanvasPixels(roomData.widthFeet), [roomData.widthFeet]);
    const canvasHeight = useMemo(() => getCanvasPixels(roomData.heightFeet), [roomData.heightFeet]);
    const [beds, setBeds] = useState([]);
    const [tables, setTables] = useState([]);
    const [cupboards, setCupboards] = useState([]);
    const [doors, setDoors] = useState([getDefaultDoor(initialCanvasWidth, initialCanvasHeight)]);
    const [selectedItem, setSelectedItem] = useState(null);

    const updateRoomSize = (field, value) => {
        const feet = Math.max(1, Number(value) || 1);
        const nextData = { ...roomData, [field]: feet };
        const nextWidth = getCanvasPixels(field === "widthFeet" ? feet : nextData.widthFeet);
        const nextHeight = getCanvasPixels(field === "heightFeet" ? feet : nextData.heightFeet);

        setRoomData(nextData);
        setDoors((currentDoors) => [getDefaultDoor(nextWidth, nextHeight, currentDoors[0])]);
    };

    const isOutOfBounds = (x, y, width, height) =>
        x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight;

    const getLayoutItems = () => [
        ...beds.map((item) => ({ ...item, type: "bed" })),
        ...tables.map((item) => ({ ...item, type: "table" })),
        ...cupboards.map((item) => ({ ...item, type: "cupboard" })),
        ...doors.map((item) => ({ ...item, type: "door" })),
    ];

    const isOverlapping = (x, y, width, height, currentId) => {
        const items = getLayoutItems();

        return items.some((item) => {
            if (item.id === currentId) return false;
            const size = getRoomItemSize(item.type, item);

            return x < item.x + size.width && x + width > item.x && y < item.y + size.height && y + height > item.y;
        });
    };

    const getNextPosition = (itemWidth, itemHeight) => {
        const existingItems = getLayoutItems();
        const maxX = canvasWidth - CANVAS_PADDING - itemWidth;
        const maxY = canvasHeight - CANVAS_PADDING - itemHeight;

        for (let y = CANVAS_PADDING; y <= maxY; y += GRID_SIZE) {
            for (let x = CANVAS_PADDING; x <= maxX; x += GRID_SIZE) {
                const occupied = existingItems.some((item) => {
                    const size = getRoomItemSize(item.type, item);

                    return (
                        x < item.x + size.width &&
                        x + itemWidth > item.x &&
                        y < item.y + size.height &&
                        y + itemHeight > item.y
                    );
                });

                if (!occupied) return { x, y };
            }
        }

        alert("No free space available in this room size");
        return null;
    };

    const addItem = (type) => {
        const config = {
            bed: {
                items: beds,
                setItems: setBeds,
                label: "Bed",
                size: DEFAULT_SIZES.bed,
                prefix: "bed",
            },
            table: {
                items: tables,
                setItems: setTables,
                label: "Table",
                size: DEFAULT_SIZES.table,
                prefix: "table",
            },
            cupboard: {
                items: cupboards,
                setItems: setCupboards,
                label: "Cupboard",
                size: DEFAULT_SIZES.cupboard,
                prefix: "cupboard",
            },
        }[type];

        const position = getNextPosition(config.size.width, config.size.height);
        if (!position) return;

        const nextNumber = config.items.length + 1;
        config.setItems([
            ...config.items,
            {
                id: `${roomId}-${config.prefix}-${nextNumber}`,
                label: `${config.label}-${nextNumber}`,
                ...config.size,
                ...position,
                rotation: 0,
            },
        ]);
    };

    const createDefaultBed = () => {
        const position = getNextPosition(DEFAULT_SIZES.bed.width, DEFAULT_SIZES.bed.height);
        if (!position) return null;

        return {
            id: `${roomId}-bed-1`,
            label: "Bed-1",
            ...DEFAULT_SIZES.bed,
            ...position,
            rotation: 0,
        };
    };

    const addDoor = () => {
        if (doors.length > 0) {
            setSelectedItem({ ...doors[0], type: "door" });
            return;
        }

        const door = getDefaultDoor(canvasWidth, canvasHeight);
        setDoors([door]);
        setSelectedItem({ ...door, type: "door" });
    };

    const updateBuilding = (buildingId) => {
        const building = buildings.find((item) => String(item.id) === String(buildingId)) || buildings[0];
        const floor = building?.floorsList?.[0] || { id: "", name: "" };
        setRoomData({
            ...roomData,
            buildingId: building?.id || "",
            buildingName: building?.name || "",
            floorId: floor.id,
            floorName: floor.name,
        });
    };

    const updateFloor = (floorId) => {
        const building = buildings.find((item) => String(item.id) === String(roomData.buildingId));
        const floor = building?.floorsList?.find((item) => String(item.id) === String(floorId));
        setRoomData({ ...roomData, floorId: floor?.id || "", floorName: floor?.name || "" });
    };

    const saveRoom = () => {
        if (!roomData.roomNumber.trim()) {
            alert("Please enter room name");
            return;
        }

        const finalBeds = beds.length === 0 && tables.length === 0 && cupboards.length === 0 ? [createDefaultBed()] : beds;
        if (finalBeds.some((item) => !item)) return;

        const rooms = getStoredRooms();
        const room = {
            id: roomId,
            roomNumber: roomData.roomNumber.trim(),
            roomType: getRoomType(finalBeds.length),
            bedCount: finalBeds.length,
            canvasWidth,
            canvasHeight,
            widthFeet: roomData.widthFeet,
            heightFeet: roomData.heightFeet,
            status: roomData.status,
            buildingId: roomData.buildingId,
            buildingName: roomData.buildingName,
            floorId: roomData.floorId,
            floorName: roomData.floorName,
            beds: finalBeds,
            tables,
            cupboards,
            doors,
        };

        saveStoredRooms([...rooms, room]);
        alert("Room Saved Successfully");

        const nextCanvasWidth = getCanvasPixels(DEFAULT_ROOM_FEET.width);
        const nextCanvasHeight = getCanvasPixels(DEFAULT_ROOM_FEET.height);
        setRoomId(createRoomId());
        setRoomData({
            roomNumber: generateRoomName(),
            widthFeet: DEFAULT_ROOM_FEET.width,
            heightFeet: DEFAULT_ROOM_FEET.height,
            status: "Available",
            buildingId: defaultBuilding.id,
            buildingName: defaultBuilding.name,
            floorId: defaultFloor.id,
            floorName: defaultFloor.name,
        });
        setBeds([]);
        setTables([]);
        setCupboards([]);
        setDoors([getDefaultDoor(nextCanvasWidth, nextCanvasHeight)]);
        setSelectedItem(null);
    };

    const updateItemPosition = (type, id, x, y) => {
        const collections = {
            bed: [beds, setBeds],
            table: [tables, setTables],
            cupboard: [cupboards, setCupboards],
            door: [doors, setDoors],
        };
        const [items, setItems] = collections[type];
        const item = items.find((entry) => entry.id === id);
        if (!item) return;
        const size = getRoomItemSize(type, item);
        const snappedPosition = snapRoomItemPosition(x, y, size.width, size.height, canvasWidth, canvasHeight);
        const nextX = snappedPosition.x;
        const nextY = snappedPosition.y;

        if (
            isOutOfBounds(nextX, nextY, size.width, size.height) ||
            isOverlapping(nextX, nextY, size.width, size.height, id)
        ) {
            alert("Items cannot overlap");
            return;
        }

        setItems(items.map((entry) => (entry.id === id ? { ...entry, ...size, x: nextX, y: nextY } : entry)));
        setSelectedItem({ ...item, ...size, x: nextX, y: nextY, type });
    };

    const deleteSelectedItem = () => {
        if (!selectedItem || selectedItem.type === "door") return;

        const collections = {
            bed: [beds, setBeds, "Bed"],
            table: [tables, setTables, "Table"],
            cupboard: [cupboards, setCupboards, "Cupboard"],
        };
        const collection = collections[selectedItem.type];
        if (!collection) return;

        const [items, setItems, labelPrefix] = collection;
        setItems(
            items
                .filter((item) => item.id !== selectedItem.id)
                .map((item, index) => ({
                    ...item,
                    label: `${labelPrefix}-${index + 1}`,
                })),
        );
        setSelectedItem(null);
    };

    const rotateSelectedItem = () => {
        if (!selectedItem) return;

        const collections = {
            bed: [beds, setBeds],
            table: [tables, setTables],
            cupboard: [cupboards, setCupboards],
            door: [doors, setDoors],
        };
        const collection = collections[selectedItem.type];
        if (!collection) return;

        const [items, setItems] = collection;
        const baseSize = DEFAULT_SIZES[selectedItem.type];
        setItems(
            items.map((item) => {
                if (item.id !== selectedItem.id) return item;

                const rotation = ((item.rotation || 0) + 90) % 360;
                const size = getRotatedSize(baseSize.width, baseSize.height, rotation);
                const snappedPosition = snapRoomItemPosition(item.x, item.y, size.width, size.height, canvasWidth, canvasHeight);
                let nextX = snappedPosition.x;
                let nextY = snappedPosition.y;

                if (
                    isOutOfBounds(nextX, nextY, size.width, size.height) ||
                    isOverlapping(nextX, nextY, size.width, size.height, item.id)
                ) {
                    const nextPosition = getNextPosition(size.width, size.height);
                    if (!nextPosition) return item;
                    nextX = nextPosition.x;
                    nextY = nextPosition.y;
                }

                const nextItem = {
                    ...item,
                    ...size,
                    rotation,
                    x: nextX,
                    y: nextY,
                };
                setSelectedItem({ ...nextItem, type: selectedItem.type });
                return nextItem;
            }),
        );
    };

    const itemActions = [
        { type: "bed", label: "Add bed", Icon: BedDouble, count: beds.length },
        { type: "table", label: "Add table", Icon: Table2, count: tables.length },
        { type: "cupboard", label: "Add cupboard", Icon: Archive, count: cupboards.length },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Add New Room</h1>
                <div className="rounded-xl bg-white p-6 shadow">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Building</span>
                            <select
                                value={roomData.buildingId}
                                onChange={(e) => updateBuilding(e.target.value)}
                                className="w-full rounded-lg border p-3"
                            >
                                {buildings.map((building) => (
                                    <option key={building.id} value={building.id}>{building.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Floor</span>
                            <select
                                value={roomData.floorId}
                                onChange={(e) => updateFloor(e.target.value)}
                                className="w-full rounded-lg border p-3"
                            >
                                {(buildings.find((item) => String(item.id) === String(roomData.buildingId))?.floorsList || []).map((floor) => (
                                    <option key={floor.id} value={floor.id}>{floor.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Room Name</span>
                            <input
                                type="text"
                                value={roomData.roomNumber}
                                onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Width (feet)</span>
                            <input
                                type="number"
                                min="1"
                                value={roomData.widthFeet}
                                onChange={(e) => updateRoomSize("widthFeet", e.target.value)}
                                className="w-full rounded-lg border p-3"
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Height (feet)</span>
                            <input
                                type="number"
                                min="1"
                                value={roomData.heightFeet}
                                onChange={(e) => updateRoomSize("heightFeet", e.target.value)}
                                className="w-full rounded-lg border p-3"
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700">Status</span>
                            <select
                                value={roomData.status}
                                onChange={(e) => setRoomData({ ...roomData, status: e.target.value })}
                                className="w-full rounded-lg border p-3"
                            >
                                <option value="Available">Available</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                            </select>
                        </label>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        Internal room id: {roomId} | Canvas: {canvasWidth}px x {canvasHeight}px
                    </p>
                </div>

                <div className="rounded-xl bg-white p-5 shadow">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-3">
                            {itemActions.map(({ type, label, Icon, count }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => addItem(type)}
                                    className="flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-white"
                                    title={label}
                                    aria-label={label}
                                >
                                    <Icon className="h-5 w-5" />
                                    <Plus className="h-4 w-4" />
                                    <span className="text-sm font-medium">{count}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={addDoor}
                                className="flex h-11 items-center gap-2 rounded-lg bg-gray-700 px-4 text-white"
                                title={doors.length > 0 ? "Select door" : "Add door"}
                                aria-label={doors.length > 0 ? "Select door" : "Add door"}
                            >
                                <DoorOpen className="h-5 w-5" />
                                <Plus className="h-4 w-4" />
                                <span className="text-sm font-medium">{doors.length}</span>
                            </button>
                            <button
                                type="button"
                                onClick={rotateSelectedItem}
                                disabled={!selectedItem}
                                className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-600 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                                title="Rotate selected item"
                                aria-label="Rotate selected item"
                            >
                                <RotateCw className="h-5 w-5" />
                            </button>
                            {selectedItem && selectedItem.type !== "door" && (
                                <button
                                    type="button"
                                    onClick={deleteSelectedItem}
                                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-700 text-white"
                                    title="Delete selected item"
                                    aria-label="Delete selected item"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={saveRoom}
                            className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white"
                        >
                            Save Room
                        </button>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <h2 className="mb-5 text-xl font-bold">Room Layout</h2>
                    <RoomCanvas
                        beds={beds}
                        tables={tables}
                        cupboards={cupboards}
                        doors={doors}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        updateBedPosition={(id, x, y) => updateItemPosition("bed", id, x, y)}
                        updateTablePosition={(id, x, y) => updateItemPosition("table", id, x, y)}
                        updateCupboardPosition={(id, x, y) => updateItemPosition("cupboard", id, x, y)}
                        updateDoorPosition={(id, x, y) => updateItemPosition("door", id, x, y)}
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        roomId={roomId}
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoomAdd;
