import {
    type CardInstrument,
    type CustomError,
    type PaymentInitializeOptions,
    type StripeElementOptions,
} from '@bigcommerce/checkout-sdk';
import { createStripeV3PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import { noop, some } from 'lodash';
import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { useHostedCreditCard } from '@bigcommerce/checkout/hosted-credit-card-integration';
import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import StripeV3CustomCardForm from './StripeV3CustomCardForm';

export interface StripeOptions {
    alipay?: StripeElementOptions;
    card: StripeElementOptions;
    cardCvc: StripeElementOptions;
    cardExpiry: StripeElementOptions;
    cardNumber: StripeElementOptions;
    iban: StripeElementOptions;
    idealBank: StripeElementOptions;
}

export enum StripeElementType {
    Alipay = 'alipay',
    Card = 'card',
    CardCvc = 'cardCvc',
    CardExpiry = 'cardExpiry',
    CardNumber = 'cardNumber',
    Iban = 'iban',
    IdealBank = 'idealBank',
}

const StripeV3PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const { useIndividualCardFields } = method.initializationData;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const paymentMethodType = method.id as StripeElementType;
    const additionalStripeV3Classes =
        paymentMethodType !== StripeElementType.Alipay
            ? 'optimizedCheckout-form-input widget--stripev3'
            : '';
    const containerId = `stripe-${paymentMethodType}-component-field`;
    const stripeOptions: StripeOptions = useMemo(() => {
        const classes = {
            base: 'form-input optimizedCheckout-form-input',
        };

        return {
            [StripeElementType.Card]: {
                classes,
            },
            [StripeElementType.CardCvc]: {
                classes,
                placeholder: '',
            },
            [StripeElementType.CardExpiry]: {
                classes,
            },
            [StripeElementType.CardNumber]: {
                classes,
                showIcon: true,
                placeholder: '',
            },
            [StripeElementType.Iban]: {
                classes,
                supportedCountries: ['SEPA'],
            },
            [StripeElementType.IdealBank]: {
                classes,
            },
        };
    }, []);

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;
    const {
        data: { getCheckout, isPaymentDataRequired, getCustomer, getConfig },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const checkout = getCheckout();
    const customer = getCustomer();
    const config = getConfig();
    const instruments = checkoutState.data.getInstruments(method) || [];
    const isGuestCustomer = customer?.isGuest;
    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    const storeUrl = useMemo(() => {
        if (!config) {
            return null;
        }

        return config.links.siteLink;
    }, [config]);

    const onUnhandledStripeV3Error = useCallback(
        (error: CustomError) => {
            if (error.type === 'stripev3_error' && error.subtype === 'auth_failure') {
                error.message = language.translate('payment.stripev3_auth_3ds_fail');
            }

            onUnhandledError(error);
        },
        [language, onUnhandledError],
    );

    const getIndividualCardElementOptions = useCallback(
        (stripeInitializeOptions: StripeOptions) => {
            return {
                cardNumberElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.CardNumber],
                    containerId: 'stripe-card-number-component-field',
                },
                cardExpiryElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.CardExpiry],
                    containerId: 'stripe-expiry-component-field',
                },
                cardCvcElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.CardCvc],
                    containerId: 'stripe-cvc-component-field',
                },
            };
        },
        [],
    );

    const getStripeOptions = useCallback(
        (stripeInitializeOptions: StripeOptions) => {
            if (useIndividualCardFields) {
                return getIndividualCardElementOptions(stripeInitializeOptions);
            }

            return stripeInitializeOptions[paymentMethodType];
        },
        [paymentMethodType, getIndividualCardElementOptions, useIndividualCardFields],
    );

    const { getHostedStoredCardValidationFieldset, getHostedFormOptions } = useHostedCreditCard({
        checkoutState,
        method,
        language,
        paymentForm,
    });

    const initializeStripePayment = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument: any) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createStripeV3PaymentStrategy],
                stripev3: {
                    containerId,
                    options: getStripeOptions(stripeOptions),
                    ...(selectedInstrument && {
                        form: await getHostedFormOptions(selectedInstrument),
                    }),
                },
            });
        },
        [containerId, getStripeOptions, stripeOptions, checkoutService, getHostedFormOptions],
    );

    const renderCustomPaymentForm = () => {
        const optionsCustomForm = getIndividualCardElementOptions(stripeOptions);

        return <StripeV3CustomCardForm options={optionsCustomForm} />;
    };

    const validateInstrument = (_shouldShowNumber: boolean, selectedInstrument: CardInstrument) => {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    };

    return (
        <>
            <HostedWidgetPaymentComponent
                {...rest}
                additionalContainerClassName={additionalStripeV3Classes}
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
                isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
                isLoadingInstruments={isLoadingInstruments()}
                isPaymentDataRequired={isPaymentDataRequired()}
                isSignedIn={some(checkout?.payments, { providerId: method.id })}
                loadInstruments={checkoutService.loadInstruments}
                method={method}
                onUnhandledError={onUnhandledStripeV3Error}
                renderCustomPaymentForm={renderCustomPaymentForm}
                setFieldValue={setFieldValue}
                setSubmit={setSubmit}
                setValidationSchema={setValidationSchema}
                shouldRenderCustomInstrument={useIndividualCardFields}
                signOut={checkoutService.signOutCustomer}
                validateInstrument={validateInstrument}
            />
            {method.id === 'iban' && (
                <p className="stripe-sepa-mandate-disclaimer">
                    <TranslatedString
                        data={{ storeUrl }}
                        id="payment.stripe_sepa_mandate_disclaimer"
                    />
                </p>
            )}
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    StripeV3PaymentMethod,
    [{ gateway: 'stripev3' }],
);
