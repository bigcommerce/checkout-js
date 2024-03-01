import { Address, CheckoutPayment, FormField } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { isPayPalFastlaneAddress, PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

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
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    const showPayPalFastlaneLabel = isPayPalFastlaneEnabled && isPayPalFastlaneAddress(address, paypalFastlaneAddresses);

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

            {showPayPalFastlaneLabel && <PoweredByPayPalFastlaneLabel />}
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
