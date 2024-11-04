import React, { FunctionComponent } from 'react';

import ConsignmentAddressSelector from './ConsignmentAddressSelector';
import ConsignmentLineItem from './ConsignmentLineItem';
import { MultiShippingConsignmentData } from './MultishippingV2Type';
import { MultiShippingOptionsV2 } from './shippingOption/MultiShippingOptionsV2';

export interface ConsignmentListItemProps {
    consignment: MultiShippingConsignmentData;
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    shippingQuoteFailedMessage: string;
    onUnhandledError(error: Error): void;
}

const ConsignmentListItem: FunctionComponent<ConsignmentListItemProps> = ({
    consignment,
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    shippingQuoteFailedMessage,
    onUnhandledError,
}: ConsignmentListItemProps) => {
    return (
        <div className="consignment-container">
            <h3 className="consignment-header">Destination #{consignmentNumber}</h3>
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
            <MultiShippingOptionsV2
                consignment={consignment}
                isLoading={isLoading}
                shippingQuoteFailedMessage={shippingQuoteFailedMessage}
            />
        </div>
    );
};

export default ConsignmentListItem;
