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

import { getAppearanceForOCSElement, getFonts } from './getStripeOCSStyles';

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
    const methodSelector = `${method.gateway}-${method.id}`;
    const containerId = `${methodSelector}-component-field`;
    const paymentContext = paymentForm;

    useEffect(() => {
        if (selectedItemId?.includes(`${method.gateway}-`)) {
            return;
        }

        collapseStripeElement.current?.();
    }, [selectedItemId, method.gateway]);

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
                [method.gateway || method.id]: {
                    containerId,
                    layout: {
                        type: 'accordion',
                        defaultCollapsed: selectedItemId !== methodSelector,
                        radios: true,
                        linkInAccordion: true,
                        spacedAccordionItems: false,
                        visibleAccordionItemsCount: 0,
                    },
                    appearance: getAppearanceForOCSElement(containerId),
                    fonts: getFonts(),
                    onError: onUnhandledError,
                    render: renderSubmitButton,
                    paymentMethodSelect: onToggle,
                    handleClosePaymentMethod: (collapseElement: () => void) => {
                        collapseStripeElement.current = collapseElement;
                    },
                },
            });
        },
        [
            containerId,
            selectedItemId,
            method,
            methodSelector,
            checkoutService,
            onUnhandledError,
            renderSubmitButton,
            onToggle,
        ],
    );

    const renderCheckoutThemeStylesForStripeOCS = () => {
        return (
            <>
                <style>
                    {`
                        .custom-checklist-item#radio-${methodSelector} {
                            border-bottom: none;
                        }
                        .custom-checklist-item#radio-${methodSelector}:last-of-type {
                            margin-bottom: -1px;
                        }
                    `}
                </style>

                <div style={{ display: 'none' }}>
                    <div
                        className="form-checklist-item optimizedCheckout-form-checklist-item"
                        id={`${containerId}--accordion-header`}
                    >
                        <input
                            className="form-checklist-checkbox optimizedCheckout-form-checklist-checkbox"
                            id={`${containerId}-radio-input`}
                            type="radio"
                        />
                        <div className="form-label optimizedCheckout-form-label" />
                    </div>
                    <div
                        className="form-checklist-header--selected"
                        id={`${containerId}--accordion-header-selected`}
                    >
                        <input
                            className="form-checklist-checkbox optimizedCheckout-form-checklist-checkbox"
                            defaultChecked
                            id={`${containerId}-radio-input-selected`}
                            type="radio"
                        />
                        <div className="form-label optimizedCheckout-form-label" />
                    </div>
                    <div className="optimizedCheckout-form-input" id={`${containerId}--input`}>
                        <div className="form-field--error">
                            <div
                                className="optimizedCheckout-form-label"
                                id={`${containerId}--error`}
                            />
                        </div>
                        <div
                            className="optimizedCheckout-form-label"
                            id={`${containerId}--label`}
                        />
                    </div>
                </div>
            </>
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
                initializePayment={initializeStripePayment}
                instruments={instruments}
                isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
                isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(
                    checkoutState,
                )}
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
            {renderCheckoutThemeStylesForStripeOCS()}
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    StripeOCSPaymentMethod,
    [
        { gateway: 'stripeupe', id: 'stripe_ocs' },
        { gateway: 'stripeocs', id: 'optimized_checkout' },
    ],
);
