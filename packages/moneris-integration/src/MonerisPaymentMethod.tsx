import { type CardInstrument, type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createMonerisPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/moneris';
import { compact, some } from 'lodash';
import React, { type FunctionComponent, useCallback } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { ErrorLevelType } from '@bigcommerce/checkout/error-handling-utils';
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

import getMonerisIframeStyles from './getMonerisIframeStyles';

const MonerisPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    onUnhandledError,
    ...rest
}) => {
    const containerId = 'moneris-iframe-container';
    const { errorLogger } = useCheckout();

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

    const getHostedFieldId = useCallback(
        (name: string) => `${compact([method.gateway, method.id]).join('-')}-${name}`,
        [method],
    );

    const cardNumberStyleContainerId = getHostedFieldId('ccNumber');
    const styleSamplerClassName = 'form-ccFields form-ccFields--without-card-name';

    const logMissingStyleContainer = useCallback(
        (error: Error) => {
            errorLogger?.log(error, { errorCode: 'monerisStyleProbe' }, ErrorLevelType.Warning, {
                containerId: cardNumberStyleContainerId,
            });
        },
        [cardNumberStyleContainerId, errorLogger],
    );

    const initializeMonerisPayment: HostedWidgetComponentProps['initializePayment'] = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument) => {
            const style = getMonerisIframeStyles({
                cardNumberContainerId: cardNumberStyleContainerId,
                onMissingStyleContainer: logMissingStyleContainer,
            });

            const paymentConfig = {
                ...options,
                integrations: [createMonerisPaymentStrategy],
                moneris: {
                    containerId,
                    style,
                    ...(selectedInstrument && {
                        form: await getHostedFormOptions(selectedInstrument),
                    }),
                },
            };

            return checkoutService.initializePayment(paymentConfig);
        },
        [
            cardNumberStyleContainerId,
            containerId,
            getHostedFormOptions,
            checkoutService,
            logMissingStyleContainer,
        ],
    );

    const validateInstrument = (_shouldShowNumber: boolean, selectedInstrument: CardInstrument) => {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    };

    const renderCheckoutThemeStylesForMoneris = () => {
        return (
            <div aria-hidden="true" className="u-hiddenVisually">
                <div className={styleSamplerClassName}>
                    <div className="form-field form-field--ccNumber">
                        <div id={cardNumberStyleContainerId} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <HostedWidgetPaymentComponent
                containerId={containerId}
                deinitializePayment={checkoutService.deinitializePayment}
                disableSubmit={disableSubmit}
                hidePaymentSubmitButton={hidePaymentSubmitButton}
                initializePayment={initializeMonerisPayment}
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
                onUnhandledError={onUnhandledError}
                setFieldValue={setFieldValue}
                setSubmit={setSubmit}
                setValidationSchema={setValidationSchema}
                signOut={checkoutService.signOutCustomer}
                storedCardValidationSchema={hostedStoredCardValidationSchema}
                validateInstrument={validateInstrument}
                {...rest}
            />
            {renderCheckoutThemeStylesForMoneris()}
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    MonerisPaymentMethod,
    [{ id: 'moneris' }],
);
