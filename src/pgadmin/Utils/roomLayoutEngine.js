// pgadmin/src/Utils/roomLayoutEngine.js

import { GRID_SIZE } from "./gridConfig";

export const ITEM_SHRINK = 5;
export const ITEM_GRID_GAP = 4;
export const CANVAS_PADDING = GRID_SIZE;

export const DEFAULT_SIZES = {
    bed: {
        width: GRID_SIZE - 1,
        height: GRID_SIZE * 2 - 1,
    },
    table: {
        width: GRID_SIZE - 1,
        height: GRID_SIZE - 1,
    },
    cupboard: {
        width: GRID_SIZE - 1,
        height: 48,
    },
    door: {
        width: GRID_SIZE - 1,
        height: 50,
    },
};

export const getRoomItemSize = (type, item = {}) => {
    const defaultSize = DEFAULT_SIZES[type];
    if (!defaultSize) {
        return {
            width: item.width,
            height: item.height,
        };
    }

    return Math.abs(item.rotation || 0) % 180 === 90
        ? {
              width: defaultSize.height,
              height: defaultSize.width,
          }
        : defaultSize;
};

export const getCenteredGridX = (canvasWidth, itemWidth) => {
    const maxX = Math.max(0, canvasWidth - itemWidth);
    const centeredX = maxX / 2;
    const snappedX = Math.round(centeredX / GRID_SIZE) * GRID_SIZE;

    return Math.min(maxX, Math.max(0, snappedX));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const snapToGridEdge = (value, itemSize, canvasSize) => {
    const maxValue = Math.max(0, canvasSize - itemSize);
    const candidates = new Set([0, maxValue]);

    for (let gridLine = 0; gridLine <= canvasSize; gridLine += GRID_SIZE) {
        candidates.add(clamp(gridLine, 0, maxValue));
        candidates.add(clamp(gridLine - itemSize, 0, maxValue));
    }

    return Array.from(candidates).reduce((best, candidate) =>
        Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best,
    );
};

export const snapRoomItemPosition = (x, y, width, height, canvasWidth, canvasHeight) => ({
    x: snapToGridEdge(x, width, canvasWidth),
    y: snapToGridEdge(y, height, canvasHeight),
});

const getRoomGrid = (bedCount) => {
    if (bedCount <= 2) return { cols: 1, rows: bedCount };
    if (bedCount <= 4) return { cols: 2, rows: Math.ceil(bedCount / 2) };
    return { cols: 3, rows: Math.ceil(bedCount / 3) };
};

export const normalizeRoomItems = (items = [], type) =>
    items.map((item) => ({
        ...item,
        ...getRoomItemSize(type, item),
    }));

export const calculateResponsiveLayout = (bedCount, canvasWidth, canvasHeight) => {
    const count = Math.min(6, Math.max(1, Number(bedCount)));
    const { cols, rows } = getRoomGrid(count);
    const bayWidth = GRID_SIZE * 4;
    const bayHeight = GRID_SIZE * 3;

    // The generated canvas grows from the item grid, so all 19 possible room items fit with breathing room.
    const width = Math.max(Number(canvasWidth) || 0, CANVAS_PADDING * 2 + cols * bayWidth);
    const height = Math.max(Number(canvasHeight) || 0, CANVAS_PADDING * 2 + rows * bayHeight + GRID_SIZE);

    const beds = [];
    const tables = [];
    const cupboards = [];

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const startX = CANVAS_PADDING + col * bayWidth;
        const startY = CANVAS_PADDING + row * bayHeight;

        beds.push({
            id: `bed-${i + 1}`,
            label: `Bed-${i + 1}`,
            x: startX,
            y: startY,
            ...DEFAULT_SIZES.bed,
            rotation: 0,
        });

        tables.push({
            id: `table-${i + 1}`,
            label: `Table-${i + 1}`,
            x: startX + GRID_SIZE,
            y: startY,
            ...DEFAULT_SIZES.table,
            rotation: 0,
        });

        cupboards.push({
            id: `cupboard-${i + 1}`,
            label: `Cupboard-${i + 1}`,
            x: startX + GRID_SIZE,
            y: startY + GRID_SIZE,
            ...DEFAULT_SIZES.cupboard,
            rotation: 0,
        });
    }

    const doors = [
        {
            id: "door-1",
            label: "Door",
            x: 0,
            y: Math.max(0, height - DEFAULT_SIZES.door.height),
            ...DEFAULT_SIZES.door,
            rotation: 0,
        },
    ];

    return {
        beds,
        tables,
        cupboards,
        doors,
        canvasWidth: width,
        canvasHeight: height,
    };
};
