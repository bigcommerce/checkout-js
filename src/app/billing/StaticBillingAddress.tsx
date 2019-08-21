import { Address } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { isValidAddress, AddressType, StaticAddress } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { withLanguage, WithLanguageProps } from '../locale';

export interface StaticBillingAddressProps {
    address: Address;
}

interface WithCheckoutStaticBillingAddressProps {
    message?: string;
}

const StaticBillingAddress: FunctionComponent<StaticBillingAddressProps & WithCheckoutStaticBillingAddressProps> = ({
    address,
    message,
}) => {
    if (message) {
        return <p>{ message }</p>;
    }

    return (
        <StaticAddress
            address={ address }
            type={ AddressType.Billing }
        />
    );
};

export function mapToStaticBillingAddressProps(
    { checkoutState }: CheckoutContextProps,
    { address, language }: StaticBillingAddressProps & WithLanguageProps
): WithCheckoutStaticBillingAddressProps | null {
    const {
        data: {
            getBillingAddressFields,
            getCheckout,
        },
    } = checkoutState;

    let message: string | undefined;

    if (isValidAddress(address, getBillingAddressFields(address.countryCode).filter(field => !field.custom))) {
        const { payments = [] } = getCheckout() || {};

        if (payments.find(payment => payment.providerId === 'amazon')) {
            message = language.translate('billing.billing_address_amazon');
        }
    }

    return {
        message,
    };
}

export default withLanguage(withCheckout(mapToStaticBillingAddressProps)(StaticBillingAddress));
