import React, { FunctionComponent } from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { EMPTY_ARRAY } from '../../common/utility';


import HostedCreditCardPaymentMethod, {
    HostedCreditCardPaymentMethodProps,
} from './HostedCreditCardPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import { PaymentMethodProps } from './PaymentMethod';
import PaymentMethodProviderType from './PaymentMethodProviderType';

export type PaypalPaymentsProPaymentMethodProps =
    | HostedPaymentMethodProps
    | HostedCreditCardPaymentMethodProps;

interface WithCheckoutPaypalPaymentsProPaymentMethodProps {
    isHostedPayment: boolean;
}

/**
 * Paypal Payments Pro is a snowflake payment method - it can be a hosted
 * payment method or a credit card payment method depending on where the
 * checkout process is initiated. If it is started from the cart page via the
 * PayPal button, it behaves as a hosted payment method. But if it is started
 * from the checkout page, it behaves as a credit card payment method.
 */
const PaypalPaymentsProPaymentMethod: FunctionComponent<
    PaypalPaymentsProPaymentMethodProps & WithCheckoutPaypalPaymentsProPaymentMethodProps
> = ({ isHostedPayment, ...props }) => {
    if (isHostedPayment) {
        return <HostedPaymentMethod {...props} />;
    }

    return <HostedCreditCardPaymentMethod {...props} />;
};

function mapToPaypalPaymentsProPaymentMethodProps(
    { checkoutState }: CheckoutContextProps,
    { method }: PaymentMethodProps,
): WithCheckoutPaypalPaymentsProPaymentMethodProps {
    const {
        data: { getCheckout },
    } = checkoutState;
    const { payments = EMPTY_ARRAY } = getCheckout() || {};
    const selectedHostedMethod = payments.find(
        ({ providerType }) => providerType === PaymentMethodProviderType.Hosted,
    );

    return {
        isHostedPayment: selectedHostedMethod
            ? selectedHostedMethod.providerId === method.id &&
              selectedHostedMethod.gatewayId === method.gateway
            : false,
    };
}

export default withCheckout(mapToPaypalPaymentsProPaymentMethodProps)(
    PaypalPaymentsProPaymentMethod,
);
