import React, { useState, useRef, useEffect } from "react";
import { FFL } from "./CustomShippingStep";
import FFLSelectOption from "./FFLSelectOption";
import "./FFLSelector.scss";

interface FFLSelectorProps {
    selectedFFL: FFL | null;
    ffls: FFL[] | null;
    handleSelectFFL: (ffl: FFL) => void;
    pickupAtSS: boolean;
}


const shootStraightLocations: FFL[] = [{
    "id": 2,
    "name": "Shoot Straight Apopka",
    "address": {
        "firstName": "12-59-095-01-5E-23499",
        "lastName": "Shoot Straight Apopka",
        "company": "Shoot Straight Apopka",
        "address1": "1349 South Orange Blossom Trail",
        "city": "Apopka",
        "stateOrProvince": "Florida",
        "postalCode": "32703",
        "country": "US",
        "address2": "NA",
        "stateOrProvinceCode": "FL",
        "countryCode": "US",
        "phone": "NA",
        "customFields": [],
        'shouldSaveAddress': false

    }
}, {
    "id": 13,
    "name": "Shoot Straight Casselberry",
    "address": {
        "firstName": "12-59-095-01-5E-23499",
        "lastName": "Shoot Straight Apopka",
        "company": "Shoot Straight Casselberry",
        "address1": "400 South Highway 17-92",
        "city": "Casselberry",
        "stateOrProvince": "Florida",
        "postalCode": "32707",
        "country": "US",
        "address2": "NA",
        "stateOrProvinceCode": "FL",
        "countryCode": "US",
        "phone": "NA",
        "customFields": [],
        'shouldSaveAddress': false

    }
},
{
    "id": 14,
    "name": "Shoot Straight Sarasota",
    "address": {
        "firstName": "12-59-095-01-5E-23499",
        "lastName": "Shoot Straight Apopka",
        "company": "Shoot Straight Sarasota",
        "address1": "5045 Fruitville Rd",
        "city": "Sarasota",
        "stateOrProvince": "Florida",
        "postalCode": "34232",
        "country": "US",
        "address2": "NA",
        "stateOrProvinceCode": "FL",
        "countryCode": "US",
        "phone": "NA",
        "customFields": [],
        'shouldSaveAddress': false

    }
}]


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
