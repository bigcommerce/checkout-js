import {
    CheckoutSelectors,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';

import BraintreeCreditCardPaymentMethod from './BraintreeCreditCardPaymentMethod';
import CCAvenueMarsPaymentMethod from './CCAvenueMarsPaymentMethod';
import HostedCreditCardPaymentMethod from './HostedCreditCardPaymentMethod';
import HostedPaymentMethod from './HostedPaymentMethod';
import MasterpassPaymentMethod from './MasterpassPaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodProviderType from './PaymentMethodProviderType';
import PaymentMethodType from './PaymentMethodType';
import PaypalPaymentsProPaymentMethod from './PaypalPaymentsProPaymentMethod';
import PPSDKPaymentMethod from './PPSDKPaymentMethod';

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

    if (method.type === PaymentMethodProviderType.PPSDK) {
        return <PPSDKPaymentMethod {...props} />;
    }

    if (method.id === PaymentMethodId.CCAvenueMars) {
        return <CCAvenueMarsPaymentMethod {...props} />;
    }

    if (method.id === PaymentMethodId.Masterpass) {
        return <MasterpassPaymentMethod {...props} />;
    }

    if (method.id === PaymentMethodId.Braintree) {
        return <BraintreeCreditCardPaymentMethod {...props} />;
    }

    if (
        method.type !== PaymentMethodProviderType.Hosted &&
        method.id === PaymentMethodId.PaypalPaymentsPro
    ) {
        return <PaypalPaymentsProPaymentMethod {...props} />;
    }


    if (
        method.id === PaymentMethodId.BraintreeVenmo ||
        method.id === PaymentMethodId.Humm ||
        method.id === PaymentMethodId.Laybuy ||
        method.id === PaymentMethodId.Quadpay ||
        method.id === PaymentMethodId.Sezzle ||
        method.id === PaymentMethodId.Zip ||
        method.method === PaymentMethodType.Paypal ||
        method.method === PaymentMethodType.PaypalCredit ||
        method.type === PaymentMethodProviderType.Hosted
    ) {
        return <HostedPaymentMethod {...props} />;
    }

    // NOTE: Some payment methods have `method` as `credit-card` but they are
    // actually not. Therefore, as a workaround, we are doing the following
    // check last.
    if (
        method.method === PaymentMethodType.CreditCard ||
        method.type === PaymentMethodProviderType.Api
    ) {
        return <HostedCreditCardPaymentMethod {...props} />;
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
