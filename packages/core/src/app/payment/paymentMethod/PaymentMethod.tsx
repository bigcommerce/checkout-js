import {
    type CheckoutSelectors,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { createNoPaymentStrategy, } from '@bigcommerce/checkout-sdk/integrations/no-payment';
import { createPayPalProPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-pro';
import { createSezzlePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/sezzle';
import { createTDOnlineMartPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/td-bank';
import { createZipPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/zip';
import React, { type FunctionComponent, lazy, memo, Suspense } from 'react';

import { CaptureMessageComponent, type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

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
        const sentryMessage = `DataHostedCreditCardPaymentMethod ${JSON.stringify(method)}`;

        return <>
                <CaptureMessageComponent message={sentryMessage} />
                <Suspense><HostedCreditCardPaymentMethod {...props} /></Suspense>
            </>;
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
        initializePayment: (options) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [
                    ...options.integrations ?? [],
                    // The strategies below don’t appear to correspond to any existing component,
                    // so they are initialized globally at the root level.
                    createNoPaymentStrategy,
                    createPayPalProPaymentStrategy,
                    createSezzlePaymentStrategy,
                    createTDOnlineMartPaymentStrategy,
                    createZipPaymentStrategy,
                ],
            });
        },
        isInitializing: isInitializingPayment(method.id),
    };
}

export default withCheckout(mapToWithCheckoutPaymentMethodProps)(memo(PaymentMethodComponent));
