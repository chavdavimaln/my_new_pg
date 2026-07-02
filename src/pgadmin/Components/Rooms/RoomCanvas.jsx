// pgadmin/src/Components/Rooms/RoomCanvas.jsx

import React, { useEffect, useRef, useState } from "react";
import BedItem from "./BedItem";
import TableItem from "./TableItem";
import CupboardItem from "./CupboardItem";
import DoorItem from "./DoorItem";
import { GRID_SIZE } from "../../Utils/gridConfig";

const RoomCanvas = ({
    beds,
    tables,
    cupboards,
    selectedItem,
    setSelectedItem,
    updateBedPosition,
    updateTablePosition,
    updateCupboardPosition,
    canvasWidth,
    canvasHeight,
    roomId,
    doors,
    updateDoorPosition,
}) => {
    const wrapperRef = useRef(null);
    const [scale, setScale] = useState(1);

    const rows = Math.ceil(canvasHeight / GRID_SIZE);
    const cols = Math.ceil(canvasWidth / GRID_SIZE);

    useEffect(() => {
        const updateScale = () => {
            if (!wrapperRef.current) return;
            const availableWidth = wrapperRef.current.clientWidth;
            const nextScale = Math.min(1, availableWidth / canvasWidth);
            setScale(Number.isFinite(nextScale) ? nextScale : 1);
        };

        updateScale();

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateScale)
                : null;
        if (wrapperRef.current && observer) observer.observe(wrapperRef.current);

        window.addEventListener("resize", updateScale);
        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", updateScale);
        };
    }, [canvasWidth]);

    return (
        <div ref={wrapperRef} className="mx-auto w-full max-w-[1200px] overflow-hidden">
            <div className="flex justify-center">
                <div style={{ width: canvasWidth * scale, height: canvasHeight * scale }}>
                <div
                    className="relative border-2 border-gray-300 rounded-xl shadow-lg bg-white overflow-hidden"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        // backgroundImage: `
                        // linear-gradient(#dbe3ee 1px, transparent 1px),
                        // linear-gradient(90deg, #dbe3ee 1px, transparent 1px)
                        // `,
                        // backgroundImage: `
                        //     linear-gradient(to right, #d1d5db 1px, transparent 1px),
                        //     linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
                        // `,
                        // backgroundSize: "80px 80px",
                    }}
                >
                    {/* Real Grid */}
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: rows }).map((_, row) =>
                            Array.from({ length: cols }).map((_, col) => (
                                <div
                                    key={`${row}-${col}`}
                                    className="absolute border border-gray-200"
                                    style={{
                                        width: GRID_SIZE,
                                        height: GRID_SIZE,
                                        left: col * GRID_SIZE,
                                        top: row * GRID_SIZE,
                                    }}
                                />
                            )),
                        )}
                    </div>
                    {beds.map((item) => (
                        <BedItem
                            key={item.id}
                            item={item}
                            selected={selectedItem?.type === "bed" && selectedItem?.id === item.id}
                            onSelect={() => setSelectedItem({ ...item, type: "bed" })}
                            onDrag={updateBedPosition}
                            roomId={roomId}
                            scale={scale}
                        />
                    ))}
                    {tables.map((item) => (
                        <TableItem
                            key={item.id}
                            item={item}
                            selected={selectedItem?.type === "table" && selectedItem?.id === item.id}
                            onSelect={() => setSelectedItem({ ...item, type: "table" })}
                            onDrag={updateTablePosition}
                            roomId={roomId}
                            scale={scale}
                        />
                    ))}
                    {cupboards.map((item) => (
                        <CupboardItem
                            key={item.id}
                            item={item}
                            selected={selectedItem?.type === "cupboard" && selectedItem?.id === item.id}
                            onSelect={() => setSelectedItem({ ...item, type: "cupboard" })}
                            onDrag={updateCupboardPosition}
                            roomId={roomId}
                            scale={scale}
                        />
                    ))}
                    {doors?.map((item) => (
                        <DoorItem
                            key={item.id}
                            item={item}
                            selected={selectedItem?.type === "door" && selectedItem?.id === item.id}
                            onSelect={() =>
                                setSelectedItem({
                                    ...item,
                                    type: "door",
                                })
                            }
                            onDrag={updateDoorPosition}
                            scale={scale}
                        />
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};

export default RoomCanvas;
