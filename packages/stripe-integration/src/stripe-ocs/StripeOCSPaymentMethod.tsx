import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { FunctionComponent, useCallback, useContext, useEffect, useRef } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { AccordionContext } from '@bigcommerce/checkout/ui';

const StripeOCSPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const collapseStripeElement = useRef<() => void>();
    const { onToggle, selectedItemId } = useContext(AccordionContext);
    const containerId = `stripe-${method.id}-component-field`;
    const paymentContext = paymentForm;

    useEffect(() => {
        if (selectedItemId?.includes('stripeupe-')) {
            return;
        }

        collapseStripeElement.current?.();
    }, [selectedItemId]);

    const renderSubmitButton = useCallback(() => {
        paymentContext.hidePaymentSubmitButton(method, false);
    }, [paymentContext, method]);

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;
    const instruments = checkoutState.data.getInstruments(method) || [];

    const {
        data: { getCheckout, isPaymentDataRequired },
        statuses: { isLoadingInstruments },
    } = checkoutState;
    const checkout = getCheckout();

    const initializeStripePayment = useCallback(
        async (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                stripeupe: {
                    containerId,
                    onError: onUnhandledError,
                    render: renderSubmitButton,
                    paymentMethodSelect: onToggle,
                    handleClosePaymentMethod: (collapseElement: () => void) => {
                        collapseStripeElement.current = collapseElement;
                    },
                },
            });
        },
        [containerId, checkoutService, onUnhandledError, renderSubmitButton, onToggle],
    );

    return (
        <HostedWidgetPaymentComponent
            {...rest}
            containerId={containerId}
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hideContentWhenSignedOut
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            initializePayment={initializeStripePayment}
            instruments={instruments}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
            isInstrumentFeatureAvailable={false}
            isLoadingInstruments={isLoadingInstruments()}
            isPaymentDataRequired={isPaymentDataRequired()}
            isSignedIn={some(checkout?.payments, { providerId: method.id })}
            loadInstruments={checkoutService.loadInstruments}
            method={method}
            setFieldValue={setFieldValue}
            setSubmit={setSubmit}
            setValidationSchema={setValidationSchema}
            signOut={checkoutService.signOutCustomer}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    StripeOCSPaymentMethod,
    [{ gateway: 'stripeupe', id: 'stripe_ocs' }],
);
