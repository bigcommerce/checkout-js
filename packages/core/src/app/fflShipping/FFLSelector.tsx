import React, { useState, useRef, useEffect } from "react";
import { FFL } from "./CustomShippingStep";
import FFLSelectOption from "./FFLSelectOption";
import "./FFLSelector.scss";
import data from './locations.json';

interface FFLSelectorProps {
    selectedFFL: FFL | null;
    ffls: FFL[] | null;
    handleSelectFFL: (ffl: FFL) => void;
    pickupAtSS: boolean;
}

const shootStraightIds = data.shootStraightIds;

const FFLSelector: React.FC<FFLSelectorProps> = ({ ffls, handleSelectFFL, selectedFFL, pickupAtSS }) => {
    // Early return if ffls is null and pickupAtSS is false
    if (!pickupAtSS && ffls === null) {
        return <></>;
    }

    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOptionClick = (ffl: FFL) => {
        handleSelectFFL(ffl);
        setIsOpen(false);
    };

    // Filter shoot straight locations from ffls
    const shootStraightLocations = (ffls || []).filter(ffl => shootStraightIds.includes(ffl.id));

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="ffl-selector" ref={selectorRef}>
            <div className="ffl-selector__header" onClick={toggleDropdown}>
                <h2 className="ffl-selector__selected">
                    {
                        selectedFFL
                            ? selectedFFL.address.company
                            : (pickupAtSS ? "Select a Shoot Straight location" : "Select an FFL location")
                    }
                </h2>
                <span className="ffl-selector__arrow">▼</span>
            </div>

            {isOpen && (
                <div className="ffl-selector__options">
                    {(pickupAtSS ? shootStraightLocations : ffls || []).map((ffl) => (
                        <div
                            key={ffl.address.company}
                            className="ffl-selector__option"
                            onClick={() => handleOptionClick(ffl)}
                        >
                            <FFLSelectOption
                                ffl={ffl}
                                handleSelectFFL={handleOptionClick}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
};


export default FFLSelector;
