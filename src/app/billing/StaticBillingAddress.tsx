import { Address, CheckoutPayment, FormField } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { isValidAddress, AddressType, StaticAddress } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { TranslatedString } from '../locale';

export interface StaticBillingAddressProps {
    address: Address;
}

interface WithCheckoutStaticBillingAddressProps {
    fields: FormField[];
    payments?: CheckoutPayment[];
}

const StaticBillingAddress: FunctionComponent<
    StaticBillingAddressProps &
    WithCheckoutStaticBillingAddressProps
> = ({
    address,
    fields,
    payments = EMPTY_ARRAY,
}) => {
    if (isValidAddress(address, fields.filter(field => !field.custom)) &&
        payments.find(payment => payment.providerId === 'amazon')) {
        return (
            <p><TranslatedString id="billing.billing_address_amazon" /></p>
        );
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
    { address }: StaticBillingAddressProps
): WithCheckoutStaticBillingAddressProps | null {
    const {
        data: {
            getBillingAddressFields,
            getCheckout,
        },
    } = checkoutState;

    const checkout = getCheckout();

    return {
        fields: getBillingAddressFields(address.countryCode),
        payments: checkout && checkout.payments,
    };
}

export default withCheckout(mapToStaticBillingAddressProps)(memo(StaticBillingAddress));
