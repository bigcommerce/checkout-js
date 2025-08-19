import {
    type CardInstrument,
    type LegacyHostedFormOptions,
    type PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { compact, forIn, some } from 'lodash';
import React, {
    type FunctionComponent,
    type ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';

import {
    getHostedInstrumentValidationSchema,
    HostedCreditCardValidation,
} from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    type HostedWidgetComponentProps,
    HostedWidgetPaymentComponent,
} from '@bigcommerce/checkout/hosted-widget-integration';
import {
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { LocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentFormContext,
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import MollieCustomCardForm from './MollieCustomCardForm';

export enum MolliePaymentMethodType {
    creditcard = 'credit_card',
}

const MolliePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutState,
    checkoutService,
    language,
    paymentForm,
    ...props
}) => {
    const paymentContext = useContext(PaymentFormContext);
    const localeContext = useContext(LocaleContext);
    const containerId = `mollie-${method.method}`;

    const [focusedFieldType, setFocusedFieldType] = useState<string>();
    const {
        setFieldTouched,
        setFieldValue,
        setSubmitted,
        submitForm,
        setSubmit,
        hidePaymentSubmitButton,
        disableSubmit,
        setValidationSchema,
    } = paymentForm;

    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);

    const {
        config: { cardCode },
    } = method;
    const isCardCodeRequired = cardCode || cardCode === null;
    const getHostedFieldId: (name: string) => string = useCallback(
        (name) => {
            return `${compact([method.gateway, method.id]).join('-')}-${name}`;
        },
        [method],
    );

    const getHostedFormOptions: (
        selectedInstrument?: CardInstrument,
    ) => Promise<LegacyHostedFormOptions> = useCallback(
        async (selectedInstrument) => {
            const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];
            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;
            const styleContainerId = selectedInstrument
                ? isInstrumentCardCodeRequired
                    ? getHostedFieldId('ccCvv')
                    : undefined
                : getHostedFieldId('ccNumber');

            return {
                fields: selectedInstrument
                    ? {
                          cardCodeVerification:
                              isInstrumentCardCodeRequired && selectedInstrument
                                  ? {
                                        accessibilityLabel: language.translate(
                                            'payment.credit_card_cvv_label',
                                        ),
                                        containerId: getHostedFieldId('ccCvv'),
                                        instrumentId: selectedInstrument.bigpayToken,
                                    }
                                  : undefined,
                          cardNumberVerification:
                              isInstrumentCardNumberRequired && selectedInstrument
                                  ? {
                                        accessibilityLabel: language.translate(
                                            'payment.credit_card_number_label',
                                        ),
                                        containerId: getHostedFieldId('ccNumber'),
                                        instrumentId: selectedInstrument.bigpayToken,
                                    }
                                  : undefined,
                      }
                    : {
                          cardCode: isCardCodeRequired
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_cvv_label',
                                    ),
                                    containerId: getHostedFieldId('ccCvv'),
                                }
                              : undefined,
                          cardExpiry: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_expiration_label',
                              ),
                              containerId: getHostedFieldId('ccExpiry'),
                              placeholder: language.translate(
                                  'payment.credit_card_expiration_placeholder_text',
                              ),
                          },
                          cardName: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_name_label',
                              ),
                              containerId: getHostedFieldId('ccName'),
                          },
                          cardNumber: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_number_label',
                              ),
                              containerId: getHostedFieldId('ccNumber'),
                          },
                      },
                styles: styleContainerId
                    ? {
                          default: await getCreditCardInputStyles(styleContainerId, styleProps),
                          error: await getCreditCardInputStyles(
                              styleContainerId,
                              styleProps,
                              CreditCardInputStylesType.Error,
                          ),
                          focus: await getCreditCardInputStyles(
                              styleContainerId,
                              styleProps,
                              CreditCardInputStylesType.Focus,
                          ),
                      }
                    : {},
                onBlur: ({ fieldType }) => {
                    if (focusedFieldType === fieldType) {
                        setFocusedFieldType(undefined);
                    }
                },
                onCardTypeChange: ({ cardType }) => {
                    setFieldValue('hostedForm.cardType', cardType);
                },
                onEnter: () => {
                    setSubmitted(true);
                    submitForm();
                },
                onFocus: ({ fieldType }) => {
                    setFocusedFieldType(fieldType);
                },
                onValidate: ({ errors = {} }) => {
                    forIn(errors, (fieldErrors = [], fieldType) => {
                        const errorKey = `hostedForm.errors.${fieldType}`;

                        setFieldValue(errorKey, fieldErrors[0]?.type ?? '');

                        if (fieldErrors[0]) {
                            setFieldTouched(errorKey);
                        }
                    });
                },
            };
        },
        [
            focusedFieldType,
            getHostedFieldId,
            isCardCodeRequired,
            isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequiredProp,
            language,
            method,
            setFieldTouched,
            setFieldValue,
            setSubmitted,
            submitForm,
        ],
    );
    const getHostedStoredCardValidationFieldset: (selectedInstrument: CardInstrument) => ReactNode =
        useCallback(
            (selectedInstrument) => {
                const isInstrumentCardNumberRequired = selectedInstrument
                    ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                    : false;
                const isInstrumentCardCodeRequired = selectedInstrument
                    ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                    : false;

                return (
                    <HostedCreditCardValidation
                        cardCodeId={
                            isInstrumentCardCodeRequired ? getHostedFieldId('ccCvv') : undefined
                        }
                        cardNumberId={
                            isInstrumentCardNumberRequired
                                ? getHostedFieldId('ccNumber')
                                : undefined
                        }
                        focusedFieldType={focusedFieldType}
                    />
                );
            },
            [
                focusedFieldType,
                getHostedFieldId,
                isInstrumentCardCodeRequiredProp,
                isInstrumentCardNumberRequiredProp,
                method,
            ],
        );
    const initializeMolliePayment: HostedWidgetComponentProps['initializePayment'] = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument) => {
            const mollieElements = getMolliesElementOptions();

            return checkoutService.initializePayment({
                ...options,
                mollie: {
                    containerId,
                    cardNumberId: mollieElements.cardNumberElementOptions.containerId,
                    cardCvcId: mollieElements.cardCvcElementOptions.containerId,
                    cardHolderId: mollieElements.cardHolderElementOptions.containerId,
                    cardExpiryId: mollieElements.cardExpiryElementOptions.containerId,
                    styles: {
                        base: {
                            color: '#333333',
                            '::placeholder': {
                                color: '#999999',
                            },
                        },
                        valid: {
                            color: '#090',
                        },
                        invalid: {
                            color: '#D14343',
                        },
                    },
                    unsupportedMethodMessage: localeContext?.language.translate(
                        'payment.mollie_unsupported_method_error',
                    ),
                    disableButton: (disabled: boolean) => {
                        if (paymentContext) {
                            disableSubmit(method, disabled);
                        }
                    },
                    ...(selectedInstrument && {
                        form: await getHostedFormOptions(selectedInstrument),
                    }),
                },
            });
        },
        [
            checkoutService,
            containerId,
            disableSubmit,
            localeContext?.language,
            getHostedFormOptions,
            paymentContext,
            method,
        ],
    );

    const getMolliesElementOptions = () => {
        return {
            cardNumberElementOptions: {
                containerId: 'mollie-card-number-component-field',
            },
            cardExpiryElementOptions: {
                containerId: 'mollie-card-expiry-component-field',
            },
            cardCvcElementOptions: {
                containerId: 'mollie-card-cvc-component-field',
            },
            cardHolderElementOptions: {
                containerId: 'mollie-card-holder-component-field',
            },
        };
    };

    function renderCustomPaymentForm() {
        const options = getMolliesElementOptions();

        return (
            <MollieCustomCardForm isCreditCard={isCreditCard()} method={method} options={options} />
        );
    }

    function isCreditCard(): boolean {
        return method.method === MolliePaymentMethodType.creditcard;
    }

    function validateInstrument(_shouldShowNumber: boolean, selectedInstrument: CardInstrument) {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    }

    const instruments = checkoutState.data.getInstruments(method) || [];

    const {
        data: { getCheckout, isPaymentDataRequired, getCustomer },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const checkout = getCheckout();
    const customer = getCustomer();
    const isGuestCustomer = customer?.isGuest;
    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    return (
        <HostedWidgetPaymentComponent
            {...props}
            containerId={containerId}
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hideContentWhenSignedOut
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            initializePayment={initializeMolliePayment}
            instruments={instruments}
            isAccountInstrument={!isCreditCard()}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
            isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
            isLoadingInstruments={isLoadingInstruments()}
            isPaymentDataRequired={isPaymentDataRequired()}
            isSignedIn={some(checkout?.payments, { providerId: method.id })}
            loadInstruments={checkoutService.loadInstruments}
            method={method}
            renderCustomPaymentForm={renderCustomPaymentForm}
            setFieldValue={setFieldValue}
            setSubmit={setSubmit}
            setValidationSchema={setValidationSchema}
            shouldRenderCustomInstrument={true}
            signOut={checkoutService.signOutCustomer}
            storedCardValidationSchema={getHostedInstrumentValidationSchema({ language })}
            validateInstrument={validateInstrument}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    MolliePaymentMethod,
    [{ gateway: 'mollie' }, { gateway: 'mollie', id: 'applepay' }],
);
