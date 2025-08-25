import { type CardInstrument, type LegacyHostedFormOptions } from '@bigcommerce/checkout-sdk';
import { compact, forIn } from 'lodash';
import React, { type FunctionComponent, type ReactNode, useCallback, useState } from 'react';

import {
    CreditCardPaymentMethodComponent,
    type CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    getHostedCreditCardValidationSchema,
    getHostedInstrumentValidationSchema,
    HostedCreditCardFieldset,
    HostedCreditCardValidation,
} from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const PayPalCommerceCreditCardsPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { checkoutService, checkoutState, paymentForm, language, method } = props;

    const { cardCode, showCardHolderName, isHostedFormEnabled, requireCustomerCode } =
        method.config;

    const [focusedFieldType, setFocusedFieldType] = useState<string>();

    const { setFieldTouched, setFieldValue, setSubmitted, submitForm } = paymentForm;
    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);

    // TODO: update checkout-sdk cardCode inteface with null value or check if it is possible to get cardCode as null at all
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    ) => Promise<LegacyHostedFormOptions> = useCallback(
        async (selectedInstrument) => {
            const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];

            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;

            // Info: to generate valid nonce for vaulted instrument with untrusted shipping address, all hosted fields must be rendered
            const shouldRenderHostedFields =
                isInstrumentCardNumberRequired || isInstrumentCardCodeRequired;

            let styleContainerId;

            if (selectedInstrument && shouldRenderHostedFields) {
                styleContainerId = getHostedFieldId('ccCvv');
            }

            if (!selectedInstrument) {
                styleContainerId = getHostedFieldId('ccNumber');
            }

            return {
                fields: selectedInstrument
                    ? {
                          cardCodeVerification: shouldRenderHostedFields
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_cvv_label',
                                    ),
                                    containerId: getHostedFieldId('ccCvv'),
                                    instrumentId: selectedInstrument.bigpayToken,
                                }
                              : undefined,
                          cardNumberVerification: shouldRenderHostedFields
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_number_label',
                                    ),
                                    containerId: getHostedFieldId('ccNumber'),
                                    instrumentId: selectedInstrument.bigpayToken,
                                }
                              : undefined,
                          cardExpiryVerification: shouldRenderHostedFields
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_expiry_label',
                                    ),
                                    containerId: getHostedFieldId('ccExpiry'),
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
                    forIn(errors, (fieldErrors, fieldType) => {
                        const errorKey = `hostedForm.errors.${fieldType}`;

                        setFieldValue(
                            errorKey,
                            fieldErrors && fieldErrors[0].type ? fieldErrors[0].type : '',
                        );

                        if (fieldErrors && fieldErrors[0]) {
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

    const getHostedStoredCardValidationFieldset: (
        selectedInstrument?: CardInstrument,
    ) => ReactNode = useCallback(
        (selectedInstrument) => {
            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;

            // Info: to generate valid nonce for vaulted instrument with untrusted shipping address, all hosted fields must be rendered
            const shouldRenderHostedFields =
                isInstrumentCardNumberRequired || isInstrumentCardCodeRequired;

            return (
                <HostedCreditCardValidation
                    cardCodeId={
                        isInstrumentCardCodeRequired ? getHostedFieldId('ccCvv') : undefined
                    }
                    cardExpiryId={
                        shouldRenderHostedFields ? getHostedFieldId('ccExpiry') : undefined
                    }
                    cardNumberId={
                        isInstrumentCardNumberRequired ? getHostedFieldId('ccNumber') : undefined
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

    const initializePayPalCommerceCreditCardPayment: CreditCardPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    paypalcommercecreditcards: {
                        form: isHostedFormEnabled
                            ? await getHostedFormOptions(selectedInstrument)
                            : undefined,
                    },
                });
            },
            [getHostedFormOptions, initializePayment],
        );

    // Info: isHostedFormEnabled is an option in store config which responsible for switching PayPal Commerce Credit Card form
    // rendering between Hosted Form and default BC fields (non-hosted)
    return isHostedFormEnabled ? (
        <CreditCardPaymentMethodComponent
            {...props}
            cardFieldset={
                <HostedCreditCardFieldset
                    additionalFields={
                        requireCustomerCode && <CreditCardCustomerCodeField name="ccCustomerCode" />
                    }
                    cardCodeId={isCardCodeRequired ? getHostedFieldId('ccCvv') : undefined}
                    cardExpiryId={getHostedFieldId('ccExpiry')}
                    cardNameId={getHostedFieldId('ccName')}
                    cardNumberId={getHostedFieldId('ccNumber')}
                    focusedFieldType={focusedFieldType}
                />
            }
            cardValidationSchema={getHostedCreditCardValidationSchema({ language })}
            deinitializePayment={checkoutService.deinitializePayment}
            getHostedFormOptions={getHostedFormOptions}
            getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
            initializePayment={initializePayPalCommerceCreditCardPayment}
            storedCardValidationSchema={getHostedInstrumentValidationSchema({
                language,
                isCardExpiryRequired: true,
            })}
        />
    ) : (
        <CreditCardPaymentMethodComponent
            {...props}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializePayPalCommerceCreditCardPayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceCreditCardsPaymentMethod,
    [{ id: 'paypalcommercecreditcards' }],
);
