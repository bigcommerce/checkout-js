import {
    type CheckoutSelectors,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, lazy, memo, Suspense } from 'react';

import { type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';

const BraintreeCreditCardPaymentMethod = lazy(() => import(/* webpackChunkName: "braintree-credit-card-payment-method" */'./BraintreeCreditCardPaymentMethod'));
const HostedCreditCardPaymentMethod = lazy(() => import(/* webpackChunkName: "hosted-credit-card-payment-method" */'./HostedCreditCardPaymentMethod'));
const HostedPaymentMethod = lazy(() => import(/* webpackChunkName: "hosted-payment-method" */'./HostedPaymentMethod'));

import PaymentMethodId from './PaymentMethodId';
import PaymentMethodProviderType from './PaymentMethodProviderType';
import PaymentMethodType from './PaymentMethodType';

export interface PaymentMethodProps {
    method: PaymentMethod;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    onUnhandledError?(error: Error): void;
    submitForm?(): void;
}

export interface WithCheckoutPaymentMethodProps {
    isInitializing: boolean;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
}

/**
 * If possible, try to avoid having components that are specific to a specific
 * payment provider or method. Instead, try to generalise the requirements and
 * use components that can are reusable for multiple payment methods. i.e.:
 * CreditCardPaymentMethod, HostedPaymentMethod etc... If it is really necessary
 * for a particular payment method, you may write a method-specific component for
 * the purpose of configuring a general-purpose component in order to fulfill
 * its specific product or technical requirements.
 */
const PaymentMethodComponent: FunctionComponent<
    PaymentMethodProps & WithCheckoutPaymentMethodProps
> = (props) => {
    const { method } = props;

    if (method.id === PaymentMethodId.Braintree) {
        return <Suspense><BraintreeCreditCardPaymentMethod {...props} /></Suspense>;
    }

    if (
        method.id === PaymentMethodId.Humm ||
        method.id === PaymentMethodId.Laybuy ||
        method.method === PaymentMethodType.Paypal ||
        method.method === PaymentMethodType.PaypalCredit ||
        method.type === PaymentMethodProviderType.Hosted
    ) {
        return <Suspense><HostedPaymentMethod {...props} /></Suspense>;
    }

    // NOTE: Some payment methods have `method` as `credit-card` but they are
    // actually not. Therefore, as a workaround, we are doing the following
    // check last.
    if (
        method.method === PaymentMethodType.CreditCard ||
        method.type === PaymentMethodProviderType.Api
    ) {
        return <Suspense><HostedCreditCardPaymentMethod {...props} /></Suspense>;
    }

    return null;
};

function mapToWithCheckoutPaymentMethodProps(
    { checkoutService, checkoutState }: CheckoutContextProps,
    { method }: PaymentMethodProps,
): WithCheckoutPaymentMethodProps {
    const {
        statuses: { isInitializingPayment },
    } = checkoutState;

    return {
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        deinitializePayment: checkoutService.deinitializePayment,
        initializeCustomer: checkoutService.initializeCustomer,
        initializePayment: checkoutService.initializePayment,
        isInitializing: isInitializingPayment(method.id),
    };
}

export default withCheckout(mapToWithCheckoutPaymentMethodProps)(memo(PaymentMethodComponent));
