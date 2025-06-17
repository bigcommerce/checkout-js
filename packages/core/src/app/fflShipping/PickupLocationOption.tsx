import React from "react";

interface PickupLocationOptionProps {
    pickupAtSS: boolean;
    handleSetPickupAtSS: (e: React.MouseEvent<HTMLDivElement>) => void;
    id: string;
    className: string; // TODO: make this support an array
    name: string;
}

const PickupLocationOption: React.FC<PickupLocationOptionProps> = ({
    pickupAtSS,
    handleSetPickupAtSS,
    id,
    className,
    name
}) => (
    <div
        id={id}
        className={className}
        onClick={handleSetPickupAtSS}
    >
        {name}
        {pickupAtSS && (
            <div id="pickupOptionActiveUnderline"></div>
        )}
    </div>
)

export default PickupLocationOption;