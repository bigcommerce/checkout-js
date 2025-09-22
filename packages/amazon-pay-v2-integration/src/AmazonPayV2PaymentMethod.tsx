import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createAmazonPayV2PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/amazon-pay';
import { some } from 'lodash';
import React, { type FunctionComponent, useCallback } from 'react';

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

const AmazonPayV2PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    paymentForm,
    method,
    method: {
        initializationData: { paymentDescriptor, paymentToken },
    },
    ...rest
}) => {
    const initializeAmazonPayV2Payment = useCallback(
        (options: PaymentInitializeOptions) =>
            checkoutService.initializePayment({
                ...options,
                integrations: [createAmazonPayV2PaymentStrategy],
                amazonpay: {
                    editButtonId: 'editButtonId',
                },
            }),
        [checkoutService],
    );

    const reload = useCallback(() => window.location.reload(), []);

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;

    const {
        data: { getCheckout, isPaymentDataRequired },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const checkout = getCheckout();
    const customer = checkoutState.data.getCustomer();
    const isGuestCustomer = customer?.isGuest;
    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    const instruments = checkoutState.data.getInstruments(method) || [];

    return (
        <HostedWidgetPaymentComponent
            {...rest}
            buttonId="editButtonId"
            containerId="paymentWidget"
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            hideWidget
            initializePayment={initializeAmazonPayV2Payment}
            instruments={instruments}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
            isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
            isLoadingInstruments={isLoadingInstruments()}
            isPaymentDataRequired={isPaymentDataRequired()}
            isSignInRequired={false}
            isSignedIn={some(checkout?.payments, { providerId: method.id })}
            loadInstruments={checkoutService.loadInstruments}
            method={method}
            onSignOut={reload}
            paymentDescriptor={paymentDescriptor}
            setFieldValue={setFieldValue}
            setSubmit={setSubmit}
            setValidationSchema={setValidationSchema}
            shouldShow={!!paymentToken}
            shouldShowDescriptor={!!paymentToken}
            shouldShowEditButton={!!paymentToken}
            signOut={checkoutService.signOutCustomer}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AmazonPayV2PaymentMethod,
    [{ id: 'amazonpay' }],
);
