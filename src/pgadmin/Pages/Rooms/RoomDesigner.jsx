// pgadmin/src/Pages/Rooms/RoomDesigner.jsx

import React, { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Save, UserPlus } from "lucide-react";
import AdminLayout from "../../Components/Layout/AdminLayout";
import { pgPath } from "../../Utils/pgBrand";
import ResponsiveSortableTable from "../../Components/Common/ResponsiveSortableTable";
import { showConfirmPopup, showErrorPopup, showSuccessPopup } from "../../../utils/popup";
import RoomCanvas from "../../Components/Rooms/RoomCanvas";
import RoomToolbar from "../../Components/Rooms/RoomToolbar";
import { GRID_SIZE } from "../../Utils/gridConfig";
import { getRotatedSize } from "../../Utils/gridConfig";
import {
    CANVAS_PADDING,
    DEFAULT_SIZES,
    getRoomItemSize,
    normalizeRoomItems,
    snapRoomItemPosition,
} from "../../Utils/roomLayoutEngine";
import {
    getAllocationForItem,
    getStoredAllocations,
    getStoredRooms,
    getStoredStudents,
    isOccupied,
    saveStoredAllocations,
    saveStoredRooms,
} from "../../Utils/allocationHelper";
import { getBuildings } from "../../Utils/pgRequirementStore";
// import { calculateResponsiveLayout } from "../../Utils/roomLayoutEngine";

const FEET_TO_PX = 75;

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

const getCanvasPixels = (feet) => Math.max(1, Number(feet) || 1) * FEET_TO_PX;
const getCanvasFeet = (pixels) => Math.max(1, Math.round((Number(pixels) || FEET_TO_PX) / FEET_TO_PX));

const RoomDesigner = () => {
    const { id } = useParams();
    const rooms = getStoredRooms();
    const roomData = rooms.find((room) => String(room.id) === String(id));
    const [beds, setBeds] = useState([]);
    const [tables, setTables] = useState([]);
    const [cupboards, setCupboards] = useState([]);
    const [doors, setDoors] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(600);
    const [canvasHeight, setCanvasHeight] = useState(400);
    const [roomName, setRoomName] = useState("");
    const [roomSizeFeet, setRoomSizeFeet] = useState({ width: 8, height: 5 });
    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);
    const [roomStatus, setRoomStatus] = useState("Available");
    const buildings = useMemo(() => getBuildings(), []);
    const [roomPlacement, setRoomPlacement] = useState({ buildingId: "", buildingName: "", floorId: "", floorName: "" });

    // setDoors(room.doors || []);

    useEffect(() => {
        const rooms = getStoredRooms();
        const room = rooms.find((item) => String(item.id) === String(id));
        if (!room) return;
        setBeds(normalizeRoomItems(room.beds || [], "bed"));
        setTables(normalizeRoomItems(room.tables || [], "table"));
        setCupboards(normalizeRoomItems(room.cupboards || [], "cupboard"));
        setDoors(normalizeRoomItems(room.doors || [], "door"));
        const widthFeet = room.widthFeet || getCanvasFeet(room.canvasWidth || 600);
        const heightFeet = room.heightFeet || getCanvasFeet(room.canvasHeight || 400);
        setRoomName(room.roomNumber || generateRoomName());
        setRoomSizeFeet({ width: widthFeet, height: heightFeet });
        setCanvasWidth(getCanvasPixels(widthFeet));
        setCanvasHeight(getCanvasPixels(heightFeet));
        setRoomStatus(room.status === "Under Maintenance" ? "Under Maintenance" : "Available");
        const building = buildings.find((item) => String(item.id) === String(room.buildingId)) || buildings[0];
        const floor = building?.floorsList?.find((item) => String(item.id) === String(room.floorId)) || building?.floorsList?.find((item) => item.name === room.floorName) || building?.floorsList?.[0];
        setRoomPlacement({
            buildingId: building?.id || "",
            buildingName: building?.name || "",
            floorId: floor?.id || "",
            floorName: floor?.name || "",
        });
        setAllocations(getStoredAllocations());
        setStudents(getStoredStudents());
    }, [id, buildings]);

    const getLayoutItems = () => [
        ...beds.map((item) => ({ ...item, type: "bed" })),
        ...tables.map((item) => ({ ...item, type: "table" })),
        ...cupboards.map((item) => ({ ...item, type: "cupboard" })),
        ...doors.map((item) => ({ ...item, type: "door" })),
    ];

    const updateRoomSize = (field, value) => {
        const feet = Math.max(1, Number(value) || 1);
        const nextSize = { ...roomSizeFeet, [field]: feet };

        setRoomSizeFeet(nextSize);
        setCanvasWidth(getCanvasPixels(nextSize.width));
        setCanvasHeight(getCanvasPixels(nextSize.height));
    };

    const changeBuilding = (buildingId) => {
        const building = buildings.find((item) => String(item.id) === String(buildingId)) || buildings[0];
        const floor = building?.floorsList?.[0] || { id: "", name: "" };
        setRoomPlacement({
            buildingId: building?.id || "",
            buildingName: building?.name || "",
            floorId: floor.id,
            floorName: floor.name,
        });
    };

    const changeFloor = (floorId) => {
        const building = buildings.find((item) => String(item.id) === String(roomPlacement.buildingId));
        const floor = building?.floorsList?.find((item) => String(item.id) === String(floorId));
        setRoomPlacement({ ...roomPlacement, floorId: floor?.id || "", floorName: floor?.name || "" });
    };

    const addBed = () => {
        if (beds.length >= 6) return;
        const pos = getNextPosition(getLayoutItems(), DEFAULT_SIZES.bed.width, DEFAULT_SIZES.bed.height);
        setBeds([
            ...beds,
            {
                id: Date.now(),
                label: `Bed-${beds.length + 1}`,
                ...DEFAULT_SIZES.bed,
                ...pos,
            },
        ]);
    };

    const addTable = () => {
        if (tables.length >= 6) {
            showErrorPopup("Table Limit Reached", "Maximum 6 tables are allowed in one room.");
            return;
        }
        const pos = getNextPosition(getLayoutItems(), DEFAULT_SIZES.table.width, DEFAULT_SIZES.table.height);
        setTables([
            ...tables,
            {
                id: Date.now(),
                label: `Table-${tables.length + 1}`,
                ...DEFAULT_SIZES.table,
                ...pos,
            },
        ]);
    };

    const addCupboard = () => {
        if (cupboards.length >= 6) {
            showErrorPopup("Cupboard Limit Reached", "Maximum 6 cupboards are allowed in one room.");
            return;
        }
        const pos = getNextPosition(getLayoutItems(), DEFAULT_SIZES.cupboard.width, DEFAULT_SIZES.cupboard.height);
        setCupboards([
            ...cupboards,
            {
                id: Date.now(),
                label: `Cupboard-${cupboards.length + 1}`,
                ...DEFAULT_SIZES.cupboard,
                ...pos,
            },
        ]);
    };
    const addDoor = () => {
        if (doors.length >= 1) {
            setSelectedItem({ ...doors[0], type: "door" });
            return;
        }
        const pos = {
            x: 0,
            y: Math.max(0, canvasHeight - DEFAULT_SIZES.door.height),
        };
        const door = {
            id: Date.now(),
            label: "Door",
            ...pos,
            ...DEFAULT_SIZES.door,
            rotation: 0,
        };
        setDoors([door]);
        setSelectedItem({ ...door, type: "door" });
    };

    const getDeleteConfig = (type) =>
        ({
            bed: {
                items: beds,
                setItems: setBeds,
                singular: "bed",
                labelPrefix: "Bed",
                allocationIdKey: "bedId",
                allocationLabelKey: "bedLabel",
                minCount: 1,
                minMessage: "At least one bed required",
            },
            table: {
                items: tables,
                setItems: setTables,
                singular: "table",
                labelPrefix: "Table",
                allocationIdKey: "tableId",
                allocationLabelKey: "tableLabel",
                minCount: 0,
            },
            cupboard: {
                items: cupboards,
                setItems: setCupboards,
                singular: "cupboard",
                labelPrefix: "Cupboard",
                allocationIdKey: "cupboardId",
                allocationLabelKey: "cupboardLabel",
                minCount: 0,
            },
        })[type];

    const renumberItems = (items, labelPrefix) =>
        items.map((item, index) => ({
            ...item,
            label: `${labelPrefix}-${index + 1}`,
        }));

    const syncAllocationLabels = (nextAllocations, type, nextItems) => {
        const config = getDeleteConfig(type);
        const labelById = new Map(nextItems.map((item) => [String(item.id), item.label]));

        return nextAllocations.map((allocation) => {
            const itemId = allocation[config.allocationIdKey];
            if (!itemId) return allocation;
            const nextLabel = labelById.get(String(itemId));
            if (!nextLabel) return allocation;

            return {
                ...allocation,
                [config.allocationLabelKey]: nextLabel,
            };
        });
    };

    const deleteSelectedItem = async () => {
        if (!selectedItem || selectedItem.type === "door") return;

        const config = getDeleteConfig(selectedItem.type);
        if (!config) return;

        if (config.items.length <= config.minCount) {
            await showErrorPopup(
                "Cannot Delete Item",
                config.minMessage || `At least one ${config.singular} is required.`,
            );
            return;
        }

        const occupied = isOccupied(selectedItem.type, selectedItem.id, id);
        if (occupied) {
            const confirmed = await showConfirmPopup({
                title: "Delete Allotted Item?",
                text: `${selectedItem.label || config.singular} is allotted to someone. If you delete it, the ${config.singular} allotment will be removed.`,
                confirmButtonText: "Delete Item",
            });
            if (!confirmed) {
                return;
            }
        }

        const nextItems = renumberItems(
            config.items.filter((item) => item.id !== selectedItem.id),
            config.labelPrefix,
        );

        config.setItems(nextItems);

        if (occupied) {
            const nextAllocations = getStoredAllocations().map((allocation) => {
                if (
                    String(allocation.roomId) === String(id) &&
                    String(allocation[config.allocationIdKey]) === String(selectedItem.id)
                ) {
                    return {
                        ...allocation,
                        [config.allocationIdKey]: "",
                        [config.allocationLabelKey]: "",
                    };
                }

                return allocation;
            });
            const syncedAllocations = syncAllocationLabels(nextAllocations, selectedItem.type, nextItems);
            saveStoredAllocations(syncedAllocations);
            setAllocations(syncedAllocations);
        } else {
            const syncedAllocations = syncAllocationLabels(getStoredAllocations(), selectedItem.type, nextItems);
            saveStoredAllocations(syncedAllocations);
            setAllocations(syncedAllocations);
        }

        setSelectedItem(null);
    };

    const rotateSelectedItem = () => {
        if (!selectedItem) return;

        const rotateCollection = (collection, setter) => {
            setter(
                collection.map((item) => {
                    if (item.id !== selectedItem.id) return item;

                    const rotation = ((item.rotation || 0) + 90) % 360;
                    const baseSize = DEFAULT_SIZES[selectedItem.type] || item;
                    const size = getRotatedSize(baseSize.width, baseSize.height, rotation);

                    const snappedPosition = snapRoomItemPosition(
                        item.x,
                        item.y,
                        size.width,
                        size.height,
                        canvasWidth,
                        canvasHeight,
                    );
                    let x = snappedPosition.x;
                    let y = snappedPosition.y;

                    const invalidPosition =
                        isOutOfBounds(x, y, size.width, size.height) ||
                        isOverlapping(x, y, size.width, size.height, item.id);

                    if (invalidPosition) {
                        const pos = getNextPosition(
                            getLayoutItems(),
                            size.width,
                            size.height,
                        );

                        x = pos.x;
                        y = pos.y;
                    }

                    const nextItem = {
                        ...item,
                        width: size.width,
                        height: size.height,
                        rotation,
                        x,
                        y,
                    };
                    setSelectedItem({ ...nextItem, type: selectedItem.type });
                    return nextItem;
                }),
            );
        };
        if (selectedItem.type === "bed") rotateCollection(beds, setBeds);
        if (selectedItem.type === "table") rotateCollection(tables, setTables);
        if (selectedItem.type === "cupboard") rotateCollection(cupboards, setCupboards);
        if (selectedItem.type === "door") rotateCollection(doors, setDoors);
    };
    const updateBedPosition = (id, x, y) => {
        const bed = beds.find((item) => item.id === id);
        if (!bed) return;
        const size = getRoomItemSize("bed", bed);
        const snappedPosition = snapRoomItemPosition(x, y, size.width, size.height, canvasWidth, canvasHeight);
        const nextX = snappedPosition.x;
        const nextY = snappedPosition.y;

        if (
            isOutOfBounds(nextX, nextY, size.width, size.height) ||
            isOverlapping(nextX, nextY, size.width, size.height, id)
        ) {
            showErrorPopup("Invalid Position", "This item cannot overlap another item.");
            return;
        }

        setBeds(beds.map((item) => (item.id === id ? { ...item, ...size, x: nextX, y: nextY } : item)));
        setSelectedItem({ ...bed, ...size, x: nextX, y: nextY, type: "bed" });
    };

    const updateTablePosition = (id, x, y) => {
        const table = tables.find((item) => item.id === id);
        if (!table) return;
        const size = getRoomItemSize("table", table);
        const snappedPosition = snapRoomItemPosition(x, y, size.width, size.height, canvasWidth, canvasHeight);
        const nextX = snappedPosition.x;
        const nextY = snappedPosition.y;

        if (
            isOutOfBounds(nextX, nextY, size.width, size.height) ||
            isOverlapping(nextX, nextY, size.width, size.height, id)
        ) {
            showErrorPopup("Invalid Position", "This item cannot overlap another item.");
            return;
        }
        setTables(tables.map((item) => (item.id === id ? { ...item, ...size, x: nextX, y: nextY } : item)));
        setSelectedItem({ ...table, ...size, x: nextX, y: nextY, type: "table" });
    };

    const updateCupboardPosition = (id, x, y) => {
        const cupboard = cupboards.find((item) => item.id === id);
        if (!cupboard) return;
        const size = getRoomItemSize("cupboard", cupboard);
        const snappedPosition = snapRoomItemPosition(x, y, size.width, size.height, canvasWidth, canvasHeight);
        const nextX = snappedPosition.x;
        const nextY = snappedPosition.y;

        if (
            isOutOfBounds(nextX, nextY, size.width, size.height) ||
            isOverlapping(nextX, nextY, size.width, size.height, id)
        ) {
            showErrorPopup("Invalid Position", "This item cannot overlap another item.");
            return;
        }

        setCupboards(cupboards.map((item) => (item.id === id ? { ...item, ...size, x: nextX, y: nextY } : item)));
        setSelectedItem({ ...cupboard, ...size, x: nextX, y: nextY, type: "cupboard" });
    };

    const updateDoorPosition = (id, x, y) => {
        const door = doors.find((item) => item.id === id);
        if (!door) return;
        const size = getRoomItemSize("door", door);
        const snappedPosition = snapRoomItemPosition(x, y, size.width, size.height, canvasWidth, canvasHeight);
        const nextX = snappedPosition.x;
        const nextY = snappedPosition.y;

        if (
            isOutOfBounds(nextX, nextY, size.width, size.height) ||
            isOverlapping(nextX, nextY, size.width, size.height, id)
        ) {
            showErrorPopup("Invalid Position", "This item cannot overlap another item.");
            return;
        }

        setDoors(doors.map((item) => (item.id === id ? { ...item, ...size, x: nextX, y: nextY } : item)));
        setSelectedItem({ ...door, ...size, x: nextX, y: nextY, type: "door" });
    };
    const saveLayout = async () => {
        if (!roomName.trim()) {
            await showErrorPopup("Room Name Required", "Please enter room name before saving the layout.");
            return;
        }

        const rooms = getStoredRooms();
        const updatedRooms = rooms.map((room) => {
            if (String(room.id) === String(id)) {
                return {
                    ...room,
                    roomNumber: roomName.trim(),
                    roomType: getRoomType(beds.length),
                    canvasWidth,
                    canvasHeight,
                    widthFeet: roomSizeFeet.width,
                    heightFeet: roomSizeFeet.height,
                    status: roomStatus,
                    buildingId: roomPlacement.buildingId,
                    buildingName: roomPlacement.buildingName,
                    floorId: roomPlacement.floorId,
                    floorName: roomPlacement.floorName,
                    beds,
                    tables,
                    cupboards,
                    doors,
                };
            }
            return room;
        });

        saveStoredRooms(updatedRooms);

        await showSuccessPopup("Layout Updated", "The room layout was updated successfully.");
    };

    // const ITEM_GAP = 20;
    // const GRID_SIZE = 40;

    // const getNextPosition = (existingItems, itemWidth, itemHeight) => {
    //     const cols = Math.floor(canvasWidth / GRID_SIZE);
    //     for (let row = 0; row < 100; row++) {
    //         for (let col = 0; col < cols; col++) {
    //             const x = col * GRID_SIZE;
    //             const y = row * GRID_SIZE;
    //             const occupied = existingItems.some((item) => item.x === x && item.y === y);
    //             if (!occupied) {
    //                 return { x, y };
    //             }
    //         }
    //     }
    //     return { x: 0, y: 0 };
    // };
    const getNextPosition = (existingItems, itemWidth, itemHeight) => {
        let width = canvasWidth;
        let height = canvasHeight;

        // Search grid cells with room padding first; if full, grow the canvas and search again.
        for (let attempt = 0; attempt < 12; attempt++) {
            const maxX = width - CANVAS_PADDING - itemWidth;
            const maxY = height - CANVAS_PADDING - itemHeight;

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

                    if (!occupied) {
                        if (width !== canvasWidth) setCanvasWidth(width);
                        if (height !== canvasHeight) setCanvasHeight(height);
                        return { x, y };
                    }
                }
            }

            if (width <= height * 1.6) {
                width += GRID_SIZE * 2;
            } else {
                height += GRID_SIZE * 2;
            }
        }

        setCanvasWidth(width);
        setCanvasHeight(height);
        return { x: CANVAS_PADDING, y: CANVAS_PADDING };
    };
    const isOutOfBounds = (x, y, width, height) =>
        x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight;

    const isOverlapping = (x, y, width, height, currentId) => {
        const items = getLayoutItems();
        return items.some((item) => {
            if (item.id === currentId) return false;
            const size = getRoomItemSize(item.type, item);
            return x < item.x + size.width && x + width > item.x && y < item.y + size.height && y + height > item.y;
        });
    };

    const getCurrentSelectedItem = () => {
        if (!selectedItem) return null;

        const collection = {
            bed: beds,
            table: tables,
            cupboard: cupboards,
            door: doors,
        }[selectedItem.type];

        return collection?.find((item) => item.id === selectedItem.id)
            ? { ...collection.find((item) => item.id === selectedItem.id), type: selectedItem.type }
            : null;
    };

    const moveSelectedItem = (deltaX, deltaY) => {
        const item = getCurrentSelectedItem();
        if (!item) return;

        const x = item.x + deltaX;
        const y = item.y + deltaY;

        if (item.type === "bed") updateBedPosition(item.id, x, y);
        if (item.type === "table") updateTablePosition(item.id, x, y);
        if (item.type === "cupboard") updateCupboardPosition(item.id, x, y);
        if (item.type === "door") updateDoorPosition(item.id, x, y);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            const tagName = event.target.tagName?.toLowerCase();
            if (!selectedItem || ["input", "select", "textarea", "button"].includes(tagName)) return;

            const moves = {
                ArrowUp: [0, -GRID_SIZE],
                ArrowDown: [0, GRID_SIZE],
                ArrowLeft: [-GRID_SIZE, 0],
                ArrowRight: [GRID_SIZE, 0],
            };

            const move = moves[event.key];
            if (!move) return;

            event.preventDefault();
            moveSelectedItem(move[0], move[1]);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem, beds, tables, cupboards, doors, canvasWidth, canvasHeight]);

    const getItemStatus = (type, item) => {
        const allocation = getAllocationForItem(type, item.id, id, allocations);
        return {
            id: item.id,
            allocation,
            status: allocation ? "Allocated" : "Vacant",
            student: allocation?.studentName || "-",
            label: item.label,
        };
    };

    const roomItems = [
        ...beds.map((item) => ({ type: "bed", ...getItemStatus("bed", item) })),
        ...tables.map((item) => ({ type: "table", ...getItemStatus("table", item) })),
        ...cupboards.map((item) => ({ type: "cupboard", ...getItemStatus("cupboard", item) })),
    ];

    const changeAllocationProfile = (allocationId, studentId) => {
        const student = students.find((item) => String(item.id) === String(studentId));
        if (!student) return;

        const updatedAllocations = allocations.map((allocation) =>
            allocation.id === allocationId
                ? {
                      ...allocation,
                      studentId: student.id,
                      studentName: student.name,
                      photo: student.photo || "",
                      phone: student.phone || "",
                      email: student.email || "",
                  }
                : allocation,
        );

        saveStoredAllocations(updatedAllocations);
        setAllocations(updatedAllocations);
    };

    const getAllocateLink = (item) => {
        const params = new URLSearchParams({ roomId: id });

        if (item.type === "bed") params.set("bedId", item.id);
        if (item.type === "table") params.set("tableId", item.id);
        if (item.type === "cupboard") params.set("cupboardId", item.id);

        return pgPath(`/student-allocation?${params.toString()}`);
    };

    const allocationColumns = [
            { key: "label", header: "Item", accessor: "label" },
            { key: "type", header: "Type", accessor: "type" },
            { key: "status", header: "Status", accessor: "status" },
            { key: "student", header: "Student / Person", accessor: "student" },
            {
                key: "action",
                header: "Action",
                sortable: false,
                searchable: false,
                render: (item) =>
                    item.allocation ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                                value={item.allocation.studentId || ""}
                                onChange={(e) => changeAllocationProfile(item.allocation.id, e.target.value)}
                                className="min-w-40 rounded border p-2"
                            >
                                <option value="">Select Profile</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                            <Link
                                to={pgPath(`/student-allocation?allocationId=${item.allocation.id}`)}
                                className="flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white"
                                title="Edit allocation"
                                aria-label="Edit allocation"
                            >
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <Link
                            to={getAllocateLink(item)}
                            className="flex h-9 w-9 items-center justify-center rounded bg-green-600 text-white"
                            title="Allocate item"
                            aria-label="Allocate item"
                        >
                            <UserPlus className="h-4 w-4" />
                        </Link>
                    ),
            },
    ];

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Room Designer - Room {roomName || roomData?.roomNumber}</h1>
                    <button
                        type="button"
                        onClick={saveLayout}
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white"
                        title="Save layout"
                        aria-label="Save layout"
                    >
                        <Save className="h-5 w-5" />
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Building</span>
                            <select
                                value={roomPlacement.buildingId}
                                onChange={(e) => changeBuilding(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            >
                                {buildings.map((building) => (
                                    <option key={building.id} value={building.id}>{building.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Floor</span>
                            <select
                                value={roomPlacement.floorId}
                                onChange={(e) => changeFloor(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            >
                                {(buildings.find((item) => String(item.id) === String(roomPlacement.buildingId))?.floorsList || []).map((floor) => (
                                    <option key={floor.id} value={floor.id}>{floor.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Room Name</span>
                            <input
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            />
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Room Type</span>
                            <input
                                type="text"
                                value={getRoomType(beds.length)}
                                readOnly
                                className="min-w-0 flex-1 rounded-lg border bg-gray-100 p-3"
                            />
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Beds</span>
                            <input
                                type="text"
                                value={beds.length}
                                readOnly
                                className="min-w-0 flex-1 rounded-lg border bg-gray-100 p-3"
                            />
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Width</span>
                            <input
                                type="number"
                                min="1"
                                value={roomSizeFeet.width}
                                onChange={(e) => updateRoomSize("width", e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            />
                            <span className="text-sm font-medium text-gray-500">feet</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Height</span>
                            <input
                                type="number"
                                min="1"
                                value={roomSizeFeet.height}
                                onChange={(e) => updateRoomSize("height", e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            />
                            <span className="text-sm font-medium text-gray-500">feet</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <span className="w-28 shrink-0 text-sm font-medium text-gray-700">Status</span>
                            <select
                                value={roomStatus}
                                onChange={(e) => setRoomStatus(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border p-3"
                            >
                                <option value="Available">Available</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                            </select>
                        </label>
                    </div>
                </div>
                <RoomToolbar
                    addBed={addBed}
                    addTable={addTable}
                    addCupboard={addCupboard}
                    deleteSelectedItem={deleteSelectedItem}
                    bedCount={beds.length}
                    tableCount={tables.length}
                    cupboardCount={cupboards.length}
                    rotateSelectedItem={rotateSelectedItem}
                    addDoor={addDoor}
                    doorCount={doors.length}
                    selectedItem={selectedItem}
                />
                <RoomCanvas
                    beds={beds}
                    tables={tables}
                    cupboards={cupboards}
                    doors={doors}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    updateBedPosition={updateBedPosition}
                    updateTablePosition={updateTablePosition}
                    updateCupboardPosition={updateCupboardPosition}
                    updateDoorPosition={updateDoorPosition}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    roomId={id}
                />
                <div className="bg-white rounded-xl shadow p-5">
                    <h2 className="text-xl font-bold mb-4">Room Allocation Status</h2>
                    <ResponsiveSortableTable
                        columns={allocationColumns}
                        rows={roomItems}
                        rowKey={(item) => `${item.type}-${item.id}`}
                        searchPlaceholder="Search allocation status..."
                        pageSize={5}
                        maxHeight="20rem"
                    />
                </div>
            </div>
        </AdminLayout>
    );
};

export default RoomDesigner;
