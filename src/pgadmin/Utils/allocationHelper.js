import { recordCollectionHistory } from "./historyStore";

export const parseStoredArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

export const getStoredRooms = () => parseStoredArray("rooms");

export const getStoredAllocations = () => parseStoredArray("allocations");

export const getStoredStudents = () => parseStoredArray("students");

export const saveStoredRooms = (rooms) => {
    recordCollectionHistory({ module: "Rooms", entityType: "Room", previous: getStoredRooms(), next: rooms, action: "Updated" });
    localStorage.setItem("rooms", JSON.stringify(rooms.filter(Boolean)));
};

export const saveStoredAllocations = (allocations) => {
    recordCollectionHistory({ module: "Allocations", entityType: "Allocation", previous: getStoredAllocations(), next: allocations, action: "Updated" });
    localStorage.setItem("allocations", JSON.stringify(allocations.filter(Boolean)));
};

export const saveStoredStudents = (students) => {
    recordCollectionHistory({ module: "Students", entityType: "Student / Person", previous: getStoredStudents(), next: students, action: "Updated" });
    localStorage.setItem("students", JSON.stringify(students.filter(Boolean)));
};

export const isOccupied = (type, itemId, roomId) => {
    const allocations = getStoredAllocations();

    return allocations.some((allocation) => {
        if (roomId && String(allocation.roomId) !== String(roomId)) return false;

        if (type === "bed") return String(allocation.bedId) === String(itemId);

        if (type === "table") return String(allocation.tableId) === String(itemId);

        if (type === "cupboard") return String(allocation.cupboardId) === String(itemId);

        return false;
    });
};

export const isRoomOccupied = (roomId, allocations = getStoredAllocations()) =>
    allocations.some((allocation) => String(allocation.roomId) === String(roomId));

export const isRoomUnderMaintenance = (room) =>
    String(room?.status || "").toLowerCase() === "under maintenance";

export const getRoomStatus = (room, allocations = getStoredAllocations()) => {
    if (isRoomUnderMaintenance(room)) return "Under Maintenance";

    const totalBeds = room?.beds?.length || Number(room?.bedCount) || 0;
    const occupiedBeds = allocations.filter(
        (allocation) => String(allocation.roomId) === String(room?.id) && allocation.bedId,
    ).length;

    if (occupiedBeds === 0) return "Available";
    if (totalBeds > 0 && occupiedBeds >= totalBeds) return "Occupied";

    return "Partially Occupied";
};

export const getVacantBedsForRoom = (room, allocations = getStoredAllocations()) => {
    const occupiedBedIds = allocations
        .filter((allocation) => String(allocation.roomId) === String(room.id))
        .map((allocation) => String(allocation.bedId));

    return (room.beds || []).filter((bed) => !occupiedBedIds.includes(String(bed.id)));
};

export const isRoomVacant = (room, allocations = getStoredAllocations()) =>
    getVacantBedsForRoom(room, allocations).length > 0;

export const getAllocationForItem = (type, itemId, roomId, allocations = getStoredAllocations()) =>
    allocations.find((allocation) => {
        if (String(allocation.roomId) !== String(roomId)) return false;
        if (type === "bed") return String(allocation.bedId) === String(itemId);
        if (type === "table") return String(allocation.tableId) === String(itemId);
        if (type === "cupboard") return String(allocation.cupboardId) === String(itemId);
        return false;
    });
