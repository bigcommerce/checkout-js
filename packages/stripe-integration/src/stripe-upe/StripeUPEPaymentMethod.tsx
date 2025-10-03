import {
    type CustomerInitializeOptions,
    type PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { createStripeUPECustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import { noop, some } from 'lodash';
import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const StripeUPEPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const containerId = `stripe-${method.id}-component-field`;
    const paymentContext = paymentForm;

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
        data: { getCheckout, isPaymentDataRequired, getPaymentProviderCustomer },
        statuses: { isLoadingInstruments },
    } = checkoutState;
    const checkout = getCheckout();
    const customer = checkoutState.data.getCustomer();
    const paymentProviderCustomer = getPaymentProviderCustomer();
    const isStripeLinkAuthenticated = paymentProviderCustomer?.stripeLinkAuthenticationState;
    const isGuestCustomer = customer?.isGuest;
    const shouldSavingCardsBeEnabled = useMemo((): boolean => {
        if (!isGuestCustomer && isStripeLinkAuthenticated) {
            return false;
        }

        return true;
    }, [isGuestCustomer, isStripeLinkAuthenticated]);
    const isInstrumentFeatureAvailable =
        shouldSavingCardsBeEnabled && !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    const getStylesFromElement = (id: string, properties: string[]) => {
        const parentContainer = document.getElementById(id);

        if (!parentContainer) {
            throw new Error(
                'Unable to retrieve input styles as the provided container ID is not valid.',
            );
        }

        return getAppliedStyles(parentContainer, properties);
    };

    const initializeStripePayment = useCallback(
        async (options: PaymentInitializeOptions) => {
            const formInput = getStylesFromElement(`${containerId}--input`, [
                'color',
                'background-color',
                'border-color',
                'box-shadow',
            ]);
            const formLabel = getStylesFromElement(`${containerId}--label`, ['color']);
            const formError = getStylesFromElement(`${containerId}--error`, ['color']);

            paymentContext.hidePaymentSubmitButton(method, true);

            return checkoutService.initializePayment({
                ...options,
                stripeupe: {
                    containerId,
                    style: {
                        labelText: formLabel.color,
                        fieldText: formInput.color,
                        fieldPlaceholderText: formInput.color,
                        fieldErrorText: formError.color,
                        fieldBackground: formInput['background-color'],
                        fieldInnerShadow: formInput['box-shadow'],
                        fieldBorder: formInput['border-color'],
                    },
                    onError: onUnhandledError,
                    render: renderSubmitButton,
                },
            });
        },
        [
            checkoutService,
            containerId,
            onUnhandledError,
            method,
            paymentContext,
            renderSubmitButton,
        ],
    );

    const initializeStripeCustomer = useCallback(
        (options: CustomerInitializeOptions) => {
            return checkoutService.initializeCustomer({
                ...options,
                integrations: [createStripeUPECustomerStrategy],
            });
        },
        [checkoutService],
    );

    const renderCheckoutThemeStylesForStripeUPE = () => {
        return (
            <div className="optimizedCheckout-form-input" id={`${containerId}--input`}>
                <div className="form-field--error">
                    <div className="optimizedCheckout-form-label" id={`${containerId}--error`} />
                </div>
                <div className="optimizedCheckout-form-label" id={`${containerId}--label`} />
            </div>
        );
    };

    return (
        <>
            <HostedWidgetPaymentComponent
                {...rest}
                containerId={containerId}
                deinitializePayment={checkoutService.deinitializePayment}
                disableSubmit={disableSubmit}
                hideContentWhenSignedOut
                hidePaymentSubmitButton={hidePaymentSubmitButton}
                initializeCustomer={initializeStripeCustomer}
                initializePayment={initializeStripePayment}
                instruments={instruments}
                isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
                isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(
                    checkoutState,
                )}
                isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
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
            {renderCheckoutThemeStylesForStripeUPE()}
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    StripeUPEPaymentMethod,
    [{ gateway: 'stripeupe' }, { gateway: 'stripeupe', id: 'klarna' }],
);
