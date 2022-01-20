import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

interface WithCheckoutStripePaymentMethodProps {
    storeUrl: string;
}
export enum StripeElementType {
    card = 'card',
}
const StripeUPEPaymentMethod: FunctionComponent<StripePaymentMethodProps & WithInjectedHostedCreditCardFieldsetProps & WithCheckoutStripePaymentMethodProps> = ({
    initializePayment,
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedStoredCardValidationSchema,
    method,
    storeUrl,
    ...rest
    }) => {
    const paymentMethodType = method.id as StripeElementType;
    const containerId = `stripe-${paymentMethodType}-component-field`;

    const initializeStripePayment: HostedWidgetPaymentMethodProps['initializePayment'] = useCallback(async (options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            stripeupe: { containerId },
        });
    }, [initializePayment, containerId]);

    return <>
        <HostedWidgetPaymentMethod
            { ...rest }
            containerId={ containerId }
            hideContentWhenSignedOut
            initializePayment={ initializeStripePayment }
            method={ method }
        />
    </>;
};

function mapFromCheckoutProps(
    { checkoutState }: CheckoutContextProps) {
    const { data: { getConfig } } = checkoutState;
    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        storeUrl: config.links.siteLink,
    };
}

export default withHostedCreditCardFieldset(withCheckout(mapFromCheckoutProps)(StripeUPEPaymentMethod));
