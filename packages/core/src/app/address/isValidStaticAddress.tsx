import { Address, FormField } from "@bigcommerce/checkout-sdk";
import { isEmpty } from "lodash";

import isValidAddress from "./isValidAddress";

export default function isValidStaticAddress(
    address: Address, 
    validateAddressFields: boolean,
    fields?: FormField[], 
): boolean {
    let isValid = !isEmpty(address);
        
    if (fields && !validateAddressFields) {
        isValid = isValidAddress(
            address,
            fields.filter((field) => !field.custom),
        );
    }

    return isValid;
}
