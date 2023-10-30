import { Address, CheckoutPayment, FormField } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { isPayPalConnectAddress, PoweredByPaypalConnectLabel, usePayPalConnectAddress } from '@bigcommerce/checkout/paypal-connect-integration';

import { AddressType, StaticAddress } from '../address';
import { withCheckout } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';

export interface StaticBillingAddressProps {
    address: Address;
}

interface WithCheckoutStaticBillingAddressProps {
    fields: FormField[];
    payments?: CheckoutPayment[];
}

const StaticBillingAddress: FunctionComponent<
    StaticBillingAddressProps & WithCheckoutStaticBillingAddressProps
> = ({ address, payments = EMPTY_ARRAY }) => {
    const { isPayPalAxoEnabled, paypalConnectAddresses } = usePayPalConnectAddress();
    const showPayPalConnectAddressLabel = isPayPalAxoEnabled && isPayPalConnectAddress(address, paypalConnectAddresses);

    if (payments.find((payment) => payment.providerId === 'amazonpay')) {
        return (
            <p>
                <TranslatedString id="billing.billing_address_amazonpay" />
            </p>
        );
    }

    return (
        <>
            <StaticAddress address={address} type={AddressType.Billing} />

            {showPayPalConnectAddressLabel && <PoweredByPaypalConnectLabel />}
        </>
    );
};

export function mapToStaticBillingAddressProps(
    { checkoutState }: CheckoutContextProps,
    { address }: StaticBillingAddressProps,
): WithCheckoutStaticBillingAddressProps | null {
    const {
        data: { getBillingAddressFields, getCheckout },
    } = checkoutState;

    const checkout = getCheckout();

    return {
        fields: getBillingAddressFields(address.countryCode),
        payments: checkout && checkout.payments,
    };
}

export default withCheckout(mapToStaticBillingAddressProps)(memo(StaticBillingAddress));
