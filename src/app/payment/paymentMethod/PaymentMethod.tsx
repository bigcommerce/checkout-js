import { CheckoutSelectors, CustomerInitializeOptions, CustomerRequestOptions, PaymentInitializeOptions, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';

import AffirmPaymentMethod from './AffirmPaymentMethod';
import AmazonPaymentMethod from './AmazonPaymentMethod';
import BraintreeCreditCardPaymentMethod from './BraintreeCreditCardPaymentMethod';
import ChasePayPaymentMethod from './ChasePayPaymentMethod';
import CreditCardPaymentMethod from './CreditCardPaymentMethod';
import CCAvenueMarsPaymentMethod from './CCAvenueMarsPaymentMethod';
import GooglePayPaymentMethod from './GooglePayPaymentMethod';
import HostedPaymentMethod from './HostedPaymentMethod';
import KlarnaPaymentMethod from './KlarnaPaymentMethod';
import MasterpassPaymentMethod from './MasterpassPaymentMethod';
import OfflinePaymentMethod from './OfflinePaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodProviderType from './PaymentMethodProviderType';
import PaymentMethodType from './PaymentMethodType';
import PaypalExpressPaymentMethod from './PaypalExpressPaymentMethod';
import PaypalPaymentsProPaymentMethod from './PaypalPaymentsProPaymentMethod';
import SquarePaymentMethod from './SquarePaymentMethod';
import StripePaymentMethod from './StripePaymentMethod';
import VisaCheckoutPaymentMethod from './VisaCheckoutPaymentMethod';

export interface PaymentMethodProps {
    method: PaymentMethod;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    onUnhandledError?(error: Error): void;
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
// tslint:disable:cyclomatic-complexity
const PaymentMethodComponent: FunctionComponent<PaymentMethodProps & WithCheckoutPaymentMethodProps> = props => {
    const { method } = props;

    if (method.id === PaymentMethodId.SquareV2) {
        return <SquarePaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.StripeV3) {
        return <StripePaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.Amazon) {
        return <AmazonPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.Affirm) {
        return <AffirmPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.Klarna) {
        return <KlarnaPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.CCAvenueMars) {
        return <CCAvenueMarsPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.ChasePay) {
        return <ChasePayPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.BraintreeVisaCheckout) {
        return <VisaCheckoutPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.BraintreeGooglePay ||
        method.id === PaymentMethodId.StripeGooglePay) {
        return <GooglePayPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.Masterpass) {
        return <MasterpassPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.Braintree) {
        return <BraintreeCreditCardPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.PaypalExpress) {
        return <PaypalExpressPaymentMethod { ...props } />;
    }

    if (method.id === PaymentMethodId.PaypalPaymentsPro) {
        return <PaypalPaymentsProPaymentMethod { ...props } />;
    }

    if (method.gateway === PaymentMethodId.Afterpay ||
        method.id === PaymentMethodId.Zip ||
        method.method === PaymentMethodType.Paypal ||
        method.method === PaymentMethodType.PaypalCredit ||
        method.type === PaymentMethodProviderType.Hosted) {
        return <HostedPaymentMethod { ...props } />;
    }

    if (method.type === PaymentMethodProviderType.Offline) {
        return <OfflinePaymentMethod { ...props } />;
    }

    // NOTE: Some payment methods have `method` as `credit-card` but they are
    // actually not. Therefore, as a workaround, we are doing the following
    // check last.
    if (method.method === PaymentMethodType.CreditCard ||
        method.type === PaymentMethodProviderType.Api) {
        return <CreditCardPaymentMethod { ...props } />;
    }

    return null;
};

function mapToWithCheckoutPaymentMethodProps(
    { checkoutService, checkoutState }: CheckoutContextProps,
    { method }: PaymentMethodProps
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
