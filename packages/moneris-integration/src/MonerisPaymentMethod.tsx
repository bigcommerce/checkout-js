import { type CardInstrument, type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { some } from 'lodash';
import React, { type FunctionComponent, useCallback } from 'react';

import {
    getHostedInstrumentValidationSchema,
    useHostedCreditCard,
} from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    type HostedWidgetComponentProps,
    HostedWidgetPaymentComponent,
} from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const MonerisPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    ...rest
}) => {
    const containerId = `moneris-iframe-container`;

    const { getHostedStoredCardValidationFieldset, getHostedFormOptions } = useHostedCreditCard({
        checkoutState,
        method,
        language,
        paymentForm,
    });

    const hostedStoredCardValidationSchema = getHostedInstrumentValidationSchema({ language });
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
    const customer = checkoutState.data.getCustomer();
    const isGuestCustomer = customer?.isGuest;

    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    const initializeMonerisPayment: HostedWidgetComponentProps['initializePayment'] = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument) => {
            const paymentConfig = {
                ...options,
                moneris: {
                    containerId,
                    ...(selectedInstrument && {
                        form: await getHostedFormOptions(selectedInstrument),
                    }),
                },
            };

            return checkoutService.initializePayment(paymentConfig);
        },
        [containerId, getHostedFormOptions, checkoutService],
    );

    const validateInstrument = (_shouldShowNumber: boolean, selectedInstrument: CardInstrument) => {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    };

    return (
        <HostedWidgetPaymentComponent
            containerId={containerId}
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            initializePayment={initializeMonerisPayment}
            instruments={instruments}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
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
            storedCardValidationSchema={hostedStoredCardValidationSchema}
            validateInstrument={validateInstrument}
            {...rest}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    MonerisPaymentMethod,
    [{ id: 'moneris' }],
);
