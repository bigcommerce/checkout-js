import React, { FC } from 'react';
import { PayPalFastlaneShippingAddressForm } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { ShippingAddressProps } from './ShippingAddress';
import { Address } from '@bigcommerce/checkout-sdk';

interface PayPalFastlaneShippingAddressProps extends ShippingAddressProps {
    methodId: string,
    shippingAddress:  Address,
}

export const PayPalFastlaneShippingAddress: FC<PayPalFastlaneShippingAddressProps> = (props) => {
    const {
        methodId,
        formFields,
        countries,
        onAddressSelect,
        onFieldChange,
        onUnhandledError,
        initialize,
        deinitialize,
        isLoading,
        shippingAddress,
    } = props;

    return (
        <PayPalFastlaneShippingAddressForm
            address={shippingAddress}
            countries={countries}
            deinitialize={deinitialize}
            formFields={formFields}
            initialize={initialize}
            isLoading={isLoading}
            methodId={methodId}
            onAddressSelect={onAddressSelect}
            onFieldChange={onFieldChange}
            onUnhandledError={onUnhandledError}
        />
    )
};
