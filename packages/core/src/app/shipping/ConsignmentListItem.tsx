import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString } from "@bigcommerce/checkout/locale";
import { useCheckout , useStyleContext } from "@bigcommerce/checkout/payment-integration-api";

import { IconClose, IconSize } from "../ui/icon";

import ConsignmentAddressSelector from './ConsignmentAddressSelector';
import ConsignmentLineItem from './ConsignmentLineItem';
import { MultiShippingConsignmentData } from './MultishippingType';
import { MultiShippingOptions } from './shippingOption/MultiShippingOptions';

export interface ConsignmentListItemProps {
    consignment: MultiShippingConsignmentData;
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    shippingQuoteFailedMessage: string;
    onUnhandledError(error: Error): void;
    resetErrorConsignmentNumber(): void;
}

const ConsignmentListItem: FunctionComponent<ConsignmentListItemProps> = ({
    consignment,
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    shippingQuoteFailedMessage,
    onUnhandledError,
    resetErrorConsignmentNumber,
}: ConsignmentListItemProps) => {

    const { checkoutService: { deleteConsignment } } = useCheckout();
    const { newFontStyle } = useStyleContext();

    const handleClose = async () => {
        await deleteConsignment(consignment.id);
        resetErrorConsignmentNumber();
    };

    return (
        <div className='consignment-container'>
            <div className={classNames('consignment-header', { 'sub-header': newFontStyle })}>
                <h3>
                    <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
                </h3>
                <a
                    className="delete-consignment"
                    data-test="delete-consignment-button"
                    href="#"
                    onClick={preventDefault(handleClose)}
                >
                    <IconClose size={IconSize.Small} />
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
                isLoading={isLoading}
                onUnhandledError={onUnhandledError}
            />
            <MultiShippingOptions
                consignment={consignment}
                isLoading={isLoading}
                resetErrorConsignmentNumber={resetErrorConsignmentNumber}
                shippingQuoteFailedMessage={shippingQuoteFailedMessage}
            />
        </div>
    );
};

export default ConsignmentListItem;
