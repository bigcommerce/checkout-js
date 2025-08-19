import {
    type CardInstrument,
    type CheckoutSelectors,
    type LanguageService,
    type LegacyHostedFormOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { compact, forIn } from 'lodash';
import React, { type ReactNode, useCallback, useState } from 'react';

import {
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

import { HostedCreditCardValidation } from '../components';

export interface UseHostedFormOptions {
    checkoutState: CheckoutSelectors;
    language: LanguageService;
    method: PaymentMethod;
    paymentForm: PaymentFormService;
}

export const useHostedCreditCard = ({
    checkoutState,
    method,
    language,
    paymentForm,
}: UseHostedFormOptions) => {
    const { setFieldTouched, setFieldValue, setSubmitted, submitForm } = paymentForm;
    const { config } = method;
    const { cardCode: requireCardCode } = config;

    const isCardCodeRequired = requireCardCode || requireCardCode === null;
    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);

    const getHostedFieldId: (name: string) => string = useCallback(
        (name) => {
            return `${compact([method.gateway, method.id]).join('-')}-${name}`;
        },
        [method],
    );

    const [focusedFieldType, setFocusedFieldType] = useState<string>();

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

    const getHostedFormOptions = useCallback(
        async (selectedInstrument: CardInstrument): Promise<LegacyHostedFormOptions> => {
            const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];
            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;
            let styleContainerId;

            if (selectedInstrument) {
                if (isInstrumentCardCodeRequired) {
                    styleContainerId = getHostedFieldId('ccCvv');
                } else if (isInstrumentCardNumberRequired) {
                    styleContainerId = getHostedFieldId('ccNumber');
                }
            } else {
                styleContainerId = getHostedFieldId('ccNumber');
            }

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

    return { getHostedStoredCardValidationFieldset, getHostedFormOptions };
};
