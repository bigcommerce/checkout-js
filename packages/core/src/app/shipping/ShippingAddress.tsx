import {
    type Address,
    type CheckoutSelectors,
    type Consignment,
    type FormField,
    type ShippingInitializeOptions,
    type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo, useContext } from 'react';

import { isPayPalFastlaneMethod } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { FormContext } from '@bigcommerce/checkout/ui';

import { AmazonPayShippingAddress } from './AmazonPayShippingAddress';
import { PayPalFastlaneShippingAddress } from './PayPalFastlaneShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';

export interface ShippingAddressProps {
    consignments: Consignment[];
    formFields: FormField[];
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    hasRequestedShippingOptions: boolean;
    validateMaxLength: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(name: string, value: string): void;
    onUnhandledError?(error: Error): void;
    onUseNewAddress(): void;
}

const ShippingAddress: FunctionComponent<ShippingAddressProps> = (props) => {
    const {
        methodId,
        formFields,
        consignments,
        onAddressSelect,
        onFieldChange,
        onUseNewAddress,
        validateMaxLength,
        isLoading,
        shippingAddress,
        hasRequestedShippingOptions,
    } = props;

    const { setSubmitted } = useContext(FormContext);

    const handleFieldChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        if (hasRequestedShippingOptions) {
            setSubmitted(true);
        }

        onFieldChange(fieldName, value);
    };

    if (methodId && isPayPalFastlaneMethod(methodId) && shippingAddress) {
        return (
            <PayPalFastlaneShippingAddress
                {...props}
                handleFieldChange={handleFieldChange}
                methodId={methodId}
                shippingAddress={shippingAddress}
            />
        )
    }

    if (methodId === 'amazonpay' && shippingAddress) {
        return (
            <AmazonPayShippingAddress
                {...props}
                shippingAddress={shippingAddress}
            />
        );
    }

    return (
        <ShippingAddressForm
            address={shippingAddress}
            consignments={consignments}
            formFields={formFields}
            isLoading={isLoading}
            onAddressSelect={onAddressSelect}
            onFieldChange={handleFieldChange}
            onUseNewAddress={onUseNewAddress}
            validateMaxLength={validateMaxLength}
        />
    );
};

export default memo(ShippingAddress);
