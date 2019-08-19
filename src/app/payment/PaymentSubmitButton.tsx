import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';

import { PaymentMethodId, PaymentMethodType } from './paymentMethod';

interface PaymentSubmitButtonTextProps {
    methodId?: string;
    methodType?: string;
}

const PaymentSubmitButtonText: FunctionComponent<PaymentSubmitButtonTextProps> = ({ methodId, methodType }) => {
    if (methodId === PaymentMethodId.Amazon) {
        return <TranslatedString id="payment.amazon_continue_action" />;
    }

    if (methodType === PaymentMethodType.VisaCheckout) {
        return <TranslatedString id="payment.visa_checkout_continue_action" />;
    }

    if (methodType === PaymentMethodType.Chasepay) {
        return <TranslatedString id="payment.chasepay_continue_action" />;
    }

    if (methodType === PaymentMethodType.Paypal) {
        return <TranslatedString id="payment.paypal_continue_action" />;
    }

    if (methodType === PaymentMethodType.PaypalCredit) {
        return <TranslatedString id="payment.paypal_credit_continue_action" />;
    }

    return <TranslatedString id="payment.place_order_action" />;
};

interface PaymentSubmitButtonProps {
    isDisabled?: boolean;
    isLoading?: boolean;
    methodId?: string;
    methodType?: string;
}

const PaymentSubmitButton: FunctionComponent<PaymentSubmitButtonProps> = ({
    isLoading,
    isDisabled,
    methodId,
    methodType,
}) => (
    <Button
        disabled={ isDisabled }
        id="checkout-payment-continue"
        isFullWidth
        isLoading={ isLoading }
        size={ ButtonSize.Large }
        type="submit"
        variant={ ButtonVariant.Action }
    >
        <PaymentSubmitButtonText
            methodId={ methodId }
            methodType={ methodType }
        />
    </Button>
);

export default PaymentSubmitButton;
