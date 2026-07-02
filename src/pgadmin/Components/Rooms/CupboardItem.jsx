// pgadmin/src/Components/Rooms/CupboardItem.jsx
import React, { useRef } from "react";
import Draggable from "react-draggable";
import { isOccupied } from "../../Utils/allocationHelper";
import cupboardReal from "../../Assets/rooms/cupboard-real.png";
const SELECTED_BORDER = "#ef4444";
const CupboardItem = ({ item, onDrag, selected, onSelect, roomId, scale = 1 }) => {
    const nodeRef = useRef(null);
    const occupied = isOccupied("cupboard", item.id, roomId);
    const rotation = item.rotation || 0;
    const isSideways = Math.abs(rotation) % 180 === 90;
    const visualWidth = isSideways ? item.height : item.width;
    const visualHeight = isSideways ? item.width : item.height;
    const allocatedStyle = occupied
        ? {
              backgroundColor: "rgba(16, 185, 129, 0.18)",
              border: "2px solid #059669",
              boxShadow: selected
                  ? `inset 0 0 0 4px ${SELECTED_BORDER}, 0 0 0 4px rgba(5, 150, 105, 0.2)`
                  : "0 0 0 4px rgba(5, 150, 105, 0.2)",
          }
        : {
              backgroundColor: "#dcfce7",
              border: "1px solid #bbf7d0",
              boxShadow: selected ? `inset 0 0 0 4px ${SELECTED_BORDER}` : "none",
          };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            position={{ x: item.x, y: item.y }}
            grid={[1, 1]}
            scale={scale}
            onStop={(e, data) => {
                if (data.x !== item.x || data.y !== item.y) {
                    onDrag(item.id, data.x, data.y);
                }
            }}
        >
            <div
                ref={nodeRef}
                onClick={onSelect}
                title={occupied ? `${item.label} allocated` : `${item.label} vacant`}
                className={`absolute cursor-move overflow-visible text-[10px] font-semibold text-indigo-950 ${
                    selected ? "z-20" : ""
                }`}
                style={{
                    width: item.width,
                    height: item.height,
                }}
            >
                <div
                    // Allocation visual: occupied assets use the same green background/border.
                    className="absolute left-1/2 top-1/2 flex items-center justify-center overflow-hidden rounded"
                    style={{
                        width: visualWidth,
                        height: visualHeight,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        ...allocatedStyle,
                    }}
                >
                    <img
                        src={cupboardReal}
                        alt=""
                        className={`absolute inset-0 h-full w-full object-fill ${occupied ? "opacity-70" : ""}`}
                        draggable="false"
                    />
                </div>
                <span
                    className={`absolute bottom-[2px] left-1/2 z-10 max-w-full -translate-x-1/2 truncate rounded px-1 py-0 text-center leading-none ${
                        occupied ? "bg-emerald-600 text-white" : "bg-white/80"
                    }`}
                >
                    {item.label}
                </span>
            </div>
        </Draggable>
    );
};

export default CupboardItem;
