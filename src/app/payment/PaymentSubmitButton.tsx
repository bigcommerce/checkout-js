import React, { memo, FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';

import { PaymentMethodId, PaymentMethodType } from './paymentMethod';

interface PaymentSubmitButtonTextProps {
    methodGateway?: string;
    methodId?: string;
    methodType?: string;
    continueWith?: string;
    ppsdkFeatureOn?: boolean;
}

const PaymentSubmitButtonText: FunctionComponent<PaymentSubmitButtonTextProps> = memo(({ methodId, continueWith, methodType, methodGateway, ppsdkFeatureOn = false }) => {

    if (ppsdkFeatureOn && continueWith) {
        return <TranslatedString data={ { methodName: continueWith } } id="payment.continue_with_action" />;
    }

    if (methodId === PaymentMethodId.Amazon) {
        return <TranslatedString id="payment.amazon_continue_action" />;
    }

    if (methodId === PaymentMethodId.AmazonPay) {
        return <TranslatedString id="payment.amazonpay_continue_action" />;
    }

    if (methodId === PaymentMethodId.Bolt) {
        return <TranslatedString id="payment.bolt_continue_action" />;
    }

    if (methodGateway === PaymentMethodId.Barclaycard) {
        return <TranslatedString id="payment.barclaycard_continue_action" />;
    }

    if (methodGateway === PaymentMethodId.BlueSnapV2) {
        return <TranslatedString id="payment.bluesnap_v2_continue_action" />;
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
});

export interface PaymentSubmitButtonProps {
    continueWith?: string;
    methodGateway?: string;
    methodId?: string;
    methodType?: string;
    isDisabled?: boolean;
}

interface WithCheckoutPaymentSubmitButtonProps {
    isInitializing?: boolean;
    isSubmitting?: boolean;
    ppsdkFeatureOn: boolean;
}

const PaymentSubmitButton: FunctionComponent<PaymentSubmitButtonProps & WithCheckoutPaymentSubmitButtonProps> = ({
    continueWith,
    isDisabled,
    isInitializing,
    isSubmitting,
    methodGateway,
    methodId,
    methodType,
    ppsdkFeatureOn,
}) => (
        <Button
            disabled={ isInitializing || isSubmitting || isDisabled }
            id="checkout-payment-continue"
            isFullWidth
            isLoading={ isSubmitting }
            size={ ButtonSize.Large }
            type="submit"
            variant={ ButtonVariant.Action }
        >
        <PaymentSubmitButtonText
            continueWith={ continueWith }
            methodGateway={ methodGateway }
            methodId={ methodId }
            methodType={ methodType }
            ppsdkFeatureOn={ ppsdkFeatureOn }
        />
        </Button>
    );

export default withCheckout(({ checkoutState, checkoutService }) => {
    const {
        statuses: {
            isInitializingCustomer,
            isInitializingPayment,
            isSubmittingOrder,
        },
    } = checkoutState;

    const ppsdkFeatureOn = Boolean(
        checkoutService.getState()
            .data.getConfig()
            ?.checkoutSettings.features['PAYMENTS-6806.enable_ppsdk_strategy']
    );

    return {
        isInitializing: isInitializingCustomer() || isInitializingPayment(),
        isSubmitting: isSubmittingOrder(),
        ppsdkFeatureOn,
    };
})(memo(PaymentSubmitButton));
