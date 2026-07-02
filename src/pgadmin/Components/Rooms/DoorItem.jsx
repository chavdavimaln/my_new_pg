import React, { useRef } from "react";
import Draggable from "react-draggable";
import doorHalfOpen from "../../Assets/rooms/door-half-open-cropped.png";

const SHOW_DOOR_LABEL = false;
const SELECTED_BORDER = "#ef4444";

const DoorItem = ({ item, onDrag, selected, onSelect, scale = 1 }) => {
    const nodeRef = useRef(null);
    const doorWidth = item.width || 74;
    const doorHeight = item.height || 50;
    const rotation = item.rotation || 0;
    const isSideways = Math.abs(rotation) % 180 === 90;
    const visualWidth = isSideways ? doorHeight : doorWidth;
    const visualHeight = isSideways ? doorWidth : doorHeight;

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            grid={[1, 1]}
            scale={scale}
            position={{
                x: item.x,
                y: item.y,
            }}
            onStop={(e, data) => {
                if (data.x !== item.x || data.y !== item.y) {
                    onDrag(item.id, data.x, data.y);
                }
            }}
        >
            <div
                ref={nodeRef}
                onClick={onSelect}
                title="Door"
                className={`absolute cursor-move overflow-visible text-[10px] font-semibold text-white ${
                    selected ? "z-20" : ""
                }`}
                style={{
                    width: doorWidth,
                    height: doorHeight,
                }}
            >
                <div
                    // Door visual: label is hidden now; flip SHOW_DOOR_LABEL to true if text is needed later.
                    className="absolute left-1/2 top-1/2 flex items-center justify-center overflow-hidden rounded-none"
                    style={{
                        width: visualWidth,
                        height: visualHeight,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        backgroundColor: "#e2e2e2",
                        border: "1px solid #e2e2e2",
                        boxShadow: selected ? `inset 0 0 0 4px ${SELECTED_BORDER}` : "none",
                    }}
                >
                    <img
                        src={doorHalfOpen}
                        alt=""
                        className="absolute inset-0 h-full w-full object-fill opacity-80"
                        draggable="false"
                    />
                    {SHOW_DOOR_LABEL && (
                        <span className="absolute inset-0 z-10 flex items-center justify-center text-[9px] font-bold leading-none">
                            Door
                        </span>
                    )}
                </div>
            </div>
        </Draggable>
    );
};

export default DoorItem;
