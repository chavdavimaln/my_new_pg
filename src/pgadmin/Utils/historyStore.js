import { getCurrentAdmin } from "./adminAuth";

const HISTORY_KEY = "pgEntityHistory";

const safeJson = (value) => {
    try {
        return JSON.parse(JSON.stringify(value || null));
    } catch {
        return null;
    }
};

export const getHistoryRecords = () => {
    try {
        const value = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(value) ? value.filter(Boolean) : [];
    } catch {
        return [];
    }
};

export const saveHistoryRecords = (records) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify((records || []).filter(Boolean).slice(0, 1000)));
};

export const recordHistory = ({ module, entityType, entityId, entityName, action, before = null, after = null, note = "" }) => {
    const admin = getCurrentAdmin();
    const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        module: module || "General",
        entityType: entityType || "Item",
        entityId: entityId || "",
        entityName: entityName || "",
        action: action || "Updated",
        before: safeJson(before),
        after: safeJson(after),
        note,
        adminId: admin?.id || "",
        adminName: admin?.name || "System",
        createdAt: new Date().toISOString(),
    };

    saveHistoryRecords([record, ...getHistoryRecords()]);
    return record;
};

export const recordCollectionHistory = ({ module, entityType, previous = [], next = [], action = "Saved" }) => {
    const previousMap = new Map((previous || []).filter(Boolean).map((item) => [String(item.id), item]));
    const nextMap = new Map((next || []).filter(Boolean).map((item) => [String(item.id), item]));

    nextMap.forEach((item, id) => {
        const before = previousMap.get(id);
        if (!before) {
            recordHistory({ module, entityType, entityId: id, entityName: item.name || item.title || item.username, action: "Created", after: item });
            return;
        }

        if (JSON.stringify(before) !== JSON.stringify(item)) {
            recordHistory({ module, entityType, entityId: id, entityName: item.name || item.title || item.username, action, before, after: item });
        }
    });

    previousMap.forEach((item, id) => {
        if (!nextMap.has(id)) {
            recordHistory({ module, entityType, entityId: id, entityName: item.name || item.title || item.username, action: "Deleted", before: item });
        }
    });
};
