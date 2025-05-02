import React from "react";
import { FFL } from "./CustomShippingStep";

interface FFLSelectOptionProps {
    ffl: FFL;
    handleSelectFFL: (ffl: FFL) => void;
}

const FFLSelectOption: React.FC<FFLSelectOptionProps> = ({ ffl, handleSelectFFL }) => {
    return (
        <div onClick={() => handleSelectFFL(ffl)}>
            <h2>{ ffl.address.company }</h2>
            <h4>{ ffl.address.address1}</h4>
            <h4>{ ffl.address.city + ", " + ffl.address.stateOrProvince + ", " + ffl.address.postalCode }</h4>
        </div>
    );
}

export default FFLSelectOption;
