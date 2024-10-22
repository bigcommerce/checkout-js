import React, { FunctionComponent } from "react";

import ConsignmentAddressSelector from './ConsignmentAddressSelector';
import ConsignmentLineItem from './ConsignmentLineItem';
import { MappedDataConsignment } from './MultishippingV2Type';

export interface ConsignmentListItemProps {
    consignment: MappedDataConsignment;
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
}

const ConsignmentListItem: FunctionComponent<ConsignmentListItemProps> = ({
    consignment,
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError
}: ConsignmentListItemProps) => {
    return (
        <div className='consignment-container'>
            <h3 className='consignment-header'>Destination #{consignmentNumber}</h3>
            <ConsignmentAddressSelector
                consignment={consignment}
                countriesWithAutocomplete={countriesWithAutocomplete}
                defaultCountryCode={defaultCountryCode}
                isLoading={isLoading}
                onUnhandledError={onUnhandledError}
                selectedAddress={consignment.shippingAddress}
            />
            <ConsignmentLineItem
                consignment={consignment}
                consignmentNumber={consignmentNumber}
                onUnhandledError={onUnhandledError}
            />
        </div>
    )
}

export default ConsignmentListItem;
