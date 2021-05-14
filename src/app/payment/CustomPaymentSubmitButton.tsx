import React, { memo, Fragment, FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';
import { IconBolt } from '../ui/icon';

import { PaymentMethodId } from './paymentMethod';

export const CUSTOM_BUTTON_SUPPORTED_METHODS = [ PaymentMethodId.Bolt ];

interface CustomPaymentSubmitButtonTextProps {
    methodGateway?: string;
    methodId?: string;
    methodType?: string;
}

const CustomPaymentSubmitButtonContents: FunctionComponent<CustomPaymentSubmitButtonTextProps> = memo(({ methodId }) => {
    if (methodId === PaymentMethodId.Bolt) {
        return (<Fragment>
            <IconBolt additionalClassName="custom-payment-submit-button-bolt-icon" />
            <TranslatedString id="payment.bolt_continue_action" />
        </Fragment>);
    }

    return <TranslatedString id="payment.place_order_action" />;
});

export interface CustomPaymentSubmitButtonProps {
    methodGateway?: string;
    methodId?: string;
    methodType?: string;
    isDisabled?: boolean;
}

interface WithCheckoutPaymentSubmitButtonProps {
    isInitializing?: boolean;
    isSubmitting?: boolean;
}

const CustomPaymentSubmitButton: FunctionComponent<CustomPaymentSubmitButtonProps & WithCheckoutPaymentSubmitButtonProps> = ({
    isDisabled,
    isInitializing,
    isSubmitting,
    methodGateway,
    methodId,
    methodType,
}) => (
        <Button
            className={ `custom-payment-submit-button-${methodId}` }
            disabled={ isInitializing || isSubmitting || isDisabled }
            id="checkout-payment-continue"
            isFullWidth
            isLoading={ isSubmitting }
            size={ ButtonSize.Large }
            type="submit"
            variant={ ButtonVariant.Action }
        >
            <CustomPaymentSubmitButtonContents
                methodGateway={ methodGateway }
                methodId={ methodId }
                methodType={ methodType }
            />
        </Button>
    );

export default withCheckout(({ checkoutState }) => {
    const {
        statuses: {
            isInitializingCustomer,
            isInitializingPayment,
            isSubmittingOrder,
        },
    } = checkoutState;

    return {
        isInitializing: isInitializingCustomer() || isInitializingPayment(),
        isSubmitting: isSubmittingOrder(),
    };
})(memo(CustomPaymentSubmitButton));
