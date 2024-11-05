import React, { FunctionComponent } from 'react';

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { IconClose, IconSize } from "../ui/icon";

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

    const { checkoutService: { deleteConsignment } } = useCheckout();

    const handleClose = async () => {
        await deleteConsignment(consignment.id);
    }

    return (
        <div className='consignment-container'>
            <div className='consignment-header'>
                <h3>Destination #{consignmentNumber}</h3>
                    <a
                        className="delete-consignment"
                        data-test="delete-consignment-button"
                        href="#"
                        onClick={preventDefault(handleClose)}
                    >
                        <IconClose size={IconSize.Small}/>
                    </a>
            </div>
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
