import { Consignment } from '@bigcommerce/checkout-sdk';
import React from "react";

import ConsignmentAddressSelector from './ConsignmentAddressSelector';

export interface ConsignmentListItemProps {
    consignment: Consignment;
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
}

const ConsignmentListItem = ({
    consignment,
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError
}: ConsignmentListItemProps) => {

    return (
        <div className='consignment-container'>
            <h3 className='consignment-header'>Shipping destination {consignmentNumber}</h3>
            <ConsignmentAddressSelector
                consignment={consignment}
                countriesWithAutocomplete={countriesWithAutocomplete}
                defaultCountryCode={defaultCountryCode}
                isLoading={isLoading}
                onUnhandledError={onUnhandledError}
                selectedAddress={consignment.shippingAddress}
            />
        </div>
    )
}

export default ConsignmentListItem;
