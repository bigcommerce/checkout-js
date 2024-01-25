import {
    CardInstrument,
    HostedFormOptions,
    Instrument,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { compact, forIn } from 'lodash';
import React, { ComponentType, FunctionComponent, ReactNode, useCallback, useState } from 'react';
import { ObjectSchema } from 'yup';

import { MapToPropsFactory } from '@bigcommerce/checkout/legacy-hoc';
import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps, PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { withForm, WithFormProps } from '../../ui/form';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
} from '../creditCard';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    isInstrumentFeatureAvailable,
} from '../storedInstrument';

import getHostedCreditCardValidationSchema, {
    HostedCreditCardValidationSchemaShape,
} from './getHostedCreditCardValidationSchema';
import getHostedInstrumentValidationSchema, {
    HostedInstrumentValidationSchemaShape,
} from './getHostedInstrumentValidationSchema';
import HostedCreditCardFieldset from './HostedCreditCardFieldset';
import HostedCreditCardValidation from './HostedCreditCardValidation';

export interface WithHostedCreditCardFieldsetProps {
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
}

export interface WithInjectedHostedCreditCardFieldsetProps {
    hostedFieldset: ReactNode;
    hostedStoredCardValidationSchema: ObjectSchema<HostedInstrumentValidationSchemaShape>;
    hostedValidationSchema: ObjectSchema<HostedCreditCardValidationSchemaShape>;
    getHostedFormOptions(selectedInstrument?: CardInstrument): Promise<HostedFormOptions>;
    getHostedStoredCardValidationFieldset(selectedInstrument?: CardInstrument): ReactNode;
}

export interface WithCheckoutContextProps {
    isCardCodeRequired: boolean;
    isInstrumentFeatureAvailable: boolean;
    isInstrumentCardCodeRequired(instrument: Instrument, method: PaymentMethod): boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
}

export default function withHostedPayPalCommerceCreditCardFieldset<
    TProps extends WithHostedCreditCardFieldsetProps,
>(
    OriginalComponent: ComponentType<TProps & Partial<WithInjectedHostedCreditCardFieldsetProps>>,
): ComponentType<Omit<TProps, keyof WithInjectedHostedCreditCardFieldsetProps>> {
    const Component: FunctionComponent<
        WithHostedCreditCardFieldsetProps &
        WithCheckoutContextProps &
        WithLanguageProps &
        WithFormProps &
        ConnectFormikProps<PaymentFormValues>
    > = ({
             formik: { setFieldValue, setFieldTouched, submitForm },
             isCardCodeRequired,
             isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
             isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
             isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
             isSubmitted,
             language,
             method,
             setSubmitted,
             ...rest
         }) => {
        const [focusedFieldType, setFocusedFieldType] = useState<string>();

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
                const isInstrumentCardExpiryRequired = selectedInstrument
                    ? !selectedInstrument.trustedShippingAddress
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
                            cardExpiryVerification:
                                isInstrumentCardExpiryRequired && selectedInstrument
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
                setFieldValue,
                setFieldTouched,
                setFocusedFieldType,
                setSubmitted,
                submitForm,
            ],
        );

        const getHostedStoredCardValidationFieldset: (
            selectedInstrument: CardInstrument,
        ) => ReactNode = useCallback(
            (selectedInstrument) => {
                const isInstrumentCardNumberRequired = selectedInstrument
                    ? isInstrumentCardNumberRequiredProp(selectedInstrument)
                    : false;
                const isInstrumentCardCodeRequired = selectedInstrument
                    ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                    : false;
                const isInstrumentCardExpiryRequired = selectedInstrument
                    ? !selectedInstrument.trustedShippingAddress
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
                        cardExpiryId={
                            isInstrumentCardExpiryRequired
                                ? getHostedFieldId('ccExpiry')
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

        if (!method.config.isHostedFormEnabled) {
            return <OriginalComponent {...(rest as TProps)} method={method} />;
        }

        return (
            <OriginalComponent
                {...(rest as TProps)}
                getHostedFormOptions={getHostedFormOptions}
                getHostedStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
                hostedFieldset={
                    <HostedCreditCardFieldset
                        additionalFields={
                            method.config.requireCustomerCode && (
                                <CreditCardCustomerCodeField name="ccCustomerCode" />
                            )
                        }
                        cardCodeId={isCardCodeRequired ? getHostedFieldId('ccCvv') : undefined}
                        cardExpiryId={getHostedFieldId('ccExpiry')}
                        cardNameId={getHostedFieldId('ccName')}
                        cardNumberId={getHostedFieldId('ccNumber')}
                        focusedFieldType={focusedFieldType}
                    />
                }
                hostedStoredCardValidationSchema={getHostedInstrumentValidationSchema({ language, isCardExpiryRequired: true })}
                hostedValidationSchema={getHostedCreditCardValidationSchema({ language })}
                method={method}
            />
        );
    };

    return connectFormik(
        withForm(withLanguage(withCheckout(mapFromCheckoutProps)(Component))),
    ) as ComponentType<Omit<TProps, keyof WithInjectedHostedCreditCardFieldsetProps>>;
}

const mapFromCheckoutProps: MapToPropsFactory<
    CheckoutContextProps,
    WithCheckoutContextProps,
    WithHostedCreditCardFieldsetProps & ConnectFormikProps<PaymentFormValues>
> = () => {
    return ({ checkoutState }, { isUsingMultiShipping = false, method }) => {
        const {
            data: { getConfig, getCustomer },
        } = checkoutState;

        const config = getConfig();
        const customer = getCustomer();

        if (!config || !customer) {
            return null;
        }

        const isInstrumentFeatureAvailableProp = isInstrumentFeatureAvailable({
            config,
            customer,
            isUsingMultiShipping,
            paymentMethod: method,
        });

        return {
            method,
            isCardCodeRequired: method.config.cardCode || method.config.cardCode === null,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredSelector(checkoutState),
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        };
    };
};
