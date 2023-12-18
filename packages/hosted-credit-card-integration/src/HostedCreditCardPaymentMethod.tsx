import { CardInstrument, HostedFormOptions } from '@bigcommerce/checkout-sdk';
import { compact, forIn } from 'lodash';
import React, { FunctionComponent, ReactNode, useCallback, useState } from 'react';

import {
    CreditCardPaymentMethodComponent,
    CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import {
    getHostedCreditCardValidationSchema,
    getHostedInstrumentValidationSchema,
    HostedCreditCardFieldset,
    HostedCreditCardValidation,
} from './components';

const HostedCreditCardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    paymentForm,
    language,
    onUnhandledError,
}) => {
    const [focusedFieldType, setFocusedFieldType] = useState<string>();

    const { setFieldTouched, setFieldValue, setSubmitted, submitForm } = paymentForm;
    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);
    const {
        config: { cardCode, showCardHolderName },
    } = method;
    const isCardCodeRequired = cardCode || cardCode === null;
    const isCardHolderNameRequired = showCardHolderName ?? true;

    const getHostedFieldId: (name: string) => string = useCallback(
        (name) => {
            return `${compact([method.gateway, method.id]).join('-')}-${name}`;
        },
        [method],
    );

    const getHostedFormOptions: (
        selectedInstrument?: CardInstrument,
    ) => Promise<HostedFormOptions> = useCallback(
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
                          cardName: isCardHolderNameRequired
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_name_label',
                                    ),
                                    containerId: getHostedFieldId('ccName'),
                                }
                              : undefined,
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
            isCardHolderNameRequired,
            isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequiredProp,
            language,
            method,
            setFieldValue,
            setFieldTouched,
            setFocusedFieldType,
            setSubmitted,
            submitForm,
        ],
    );

    const hostedFieldset = (
        <HostedCreditCardFieldset
            additionalFields={
                method.config.requireCustomerCode && (
                    <CreditCardCustomerCodeField name="ccCustomerCode" />
                )
            }
            cardCodeId={isCardCodeRequired ? getHostedFieldId('ccCvv') : undefined}
            cardExpiryId={getHostedFieldId('ccExpiry')}
            cardNameId={isCardHolderNameRequired ? getHostedFieldId('ccName') : undefined}
            cardNumberId={getHostedFieldId('ccNumber')}
            focusedFieldType={focusedFieldType}
        />
    );
    const hostedValidationSchema = getHostedCreditCardValidationSchema({ language });

    const getHostedStoredCardValidationFieldset: (selectedInstrument: CardInstrument) => ReactNode =
        useCallback(
            (selectedInstrument) => {
                const isInstrumentCardNumberRequired = selectedInstrument
                    ? isInstrumentCardNumberRequiredProp(selectedInstrument)
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

    const initializePayment = checkoutService.initializePayment;

    const initializeHostedCreditCardPayment: CreditCardPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    creditCard: {
                        form: await getHostedFormOptions(selectedInstrument),
                        bigpayToken: selectedInstrument?.bigpayToken,
                    },
                });
            },
            [getHostedFormOptions, initializePayment],
        );

    const hostedStoredCardValidationSchema = getHostedInstrumentValidationSchema({ language });

    const props = {
        checkoutService,
        checkoutState,
        paymentForm,
        language,
        method,
        onUnhandledError,
    };

    return (
        <CreditCardPaymentMethodComponent
            {...props}
            cardFieldset={hostedFieldset}
            cardValidationSchema={hostedValidationSchema}
            deinitializePayment={checkoutService.deinitializePayment}
            getHostedFormOptions={getHostedFormOptions}
            getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
            initializePayment={initializeHostedCreditCardPayment}
            storedCardValidationSchema={hostedStoredCardValidationSchema}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    HostedCreditCardPaymentMethod,
    [
        {
            id: 'hosted-credit-card',
        },
        { id: 'credit_card', gateway: 'bluesnapdirect' },
        { id: 'tdonlinemart' },
    ],
);
