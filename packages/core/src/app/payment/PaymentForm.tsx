import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik, WithFormikConfig } from 'formik';
import { isNil, noop, omitBy } from 'lodash';
import React, { FunctionComponent, memo, useCallback, useContext, useMemo } from 'react';
import { ObjectSchema } from 'yup';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext } from '@bigcommerce/checkout/ui';

import { TermsConditions } from '../termsConditions';
import { Fieldset, Form } from '../ui/form';

import getPaymentValidationSchema from './getPaymentValidationSchema';
import {
    getPaymentMethodName,
    getUniquePaymentMethodId,
    PaymentMethodId,
    PaymentMethodList,
} from './paymentMethod';
import PaymentRedeemables from './PaymentRedeemables';
import PaymentSubmitButton from './PaymentSubmitButton';
import SpamProtectionField from './SpamProtectionField';
import { StoreCreditField, StoreCreditOverlay } from './storeCredit';

export interface PaymentFormProps {
    availableStoreCredit?: number;
    defaultGatewayId?: string;
    defaultMethodId: string;
    didExceedSpamLimit?: boolean;
    isEmbedded?: boolean;
    isInitializingPayment?: boolean;
    isTermsConditionsRequired?: boolean;
    isUsingMultiShipping?: boolean;
    isStoreCreditApplied: boolean;
    methods: PaymentMethod[];
    selectedMethod?: PaymentMethod;
    shouldShowStoreCredit?: boolean;
    shouldDisableSubmit?: boolean;
    shouldHidePaymentSubmitButton?: boolean;
    shouldExecuteSpamCheck?: boolean;
    termsConditionsText?: string;
    termsConditionsUrl?: string;
    usableStoreCredit?: number;
    validationSchema?: ObjectSchema<Partial<PaymentFormValues>>;
    isPaymentDataRequired(): boolean;
    onMethodSelect?(method: PaymentMethod): void;
    onStoreCreditChange?(useStoreCredit?: boolean): void;
    onSubmit?(values: PaymentFormValues): void;
    onUnhandledError?(error: Error): void;
}

const PaymentForm: FunctionComponent<
    PaymentFormProps & FormikProps<PaymentFormValues> & WithLanguageProps
> = ({
    availableStoreCredit = 0,
    didExceedSpamLimit,
    isEmbedded,
    isInitializingPayment,
    isPaymentDataRequired,
    isTermsConditionsRequired,
    isStoreCreditApplied,
    isUsingMultiShipping,
    language,
    methods,
    onMethodSelect,
    onStoreCreditChange,
    onUnhandledError,
    resetForm,
    selectedMethod,
    shouldDisableSubmit,
    shouldHidePaymentSubmitButton,
    shouldExecuteSpamCheck,
    termsConditionsText = '',
    termsConditionsUrl,
    usableStoreCredit = 0,
    values,
}) => {
    const selectedMethodId = useMemo(() => {
        if (!selectedMethod) {
            return;
        }

        switch (selectedMethod.id) {
            case PaymentMethodId.AmazonPay:
                if (selectedMethod.initializationData.paymentToken) {
                    return;
                }

                return selectedMethod.id;

            default:
                return selectedMethod.id;
        }
    }, [selectedMethod]);

    const brandName = useMemo(() => {
        if (!selectedMethod) {
            return;
        }

        return (
            selectedMethod.initializationData?.payPalCreditProductBrandName?.credit ||
            selectedMethod.initializationData?.payPalCreditProductBrandName
        );
    }, [selectedMethod]);

    if (shouldExecuteSpamCheck) {
        return (
            <SpamProtectionField
                didExceedSpamLimit={didExceedSpamLimit}
                onUnhandledError={onUnhandledError}
            />
        );
    }

    return (
        <Form className="checkout-form" testId="payment-form">
            {usableStoreCredit > 0 && (
                <StoreCreditField
                    availableStoreCredit={availableStoreCredit}
                    isStoreCreditApplied={isStoreCreditApplied}
                    name="useStoreCredit"
                    onChange={onStoreCreditChange}
                    usableStoreCredit={usableStoreCredit}
                />
            )}

            <PaymentMethodListFieldset
                isEmbedded={isEmbedded}
                isInitializingPayment={isInitializingPayment}
                isPaymentDataRequired={isPaymentDataRequired}
                isUsingMultiShipping={isUsingMultiShipping}
                methods={methods}
                onMethodSelect={onMethodSelect}
                onUnhandledError={onUnhandledError}
                resetForm={resetForm}
                values={values}
            />

            <PaymentRedeemables />

            {isTermsConditionsRequired && (
                <TermsConditions
                    termsConditionsText={termsConditionsText}
                    termsConditionsUrl={termsConditionsUrl}
                />
            )}

            <div className="form-actions">
                {shouldHidePaymentSubmitButton ? (
                    <PaymentMethodSubmitButtonContainer />
                ) : (
                    <PaymentSubmitButton
                        brandName={brandName}
                        initialisationStrategyType={
                            selectedMethod && selectedMethod.initializationStrategy?.type
                        }
                        isComplete={!!selectedMethod?.initializationData?.isComplete}
                        isDisabled={shouldDisableSubmit}
                        methodGateway={selectedMethod && selectedMethod.gateway}
                        methodId={selectedMethodId}
                        methodName={
                            selectedMethod && getPaymentMethodName(language)(selectedMethod)
                        }
                        methodType={selectedMethod && selectedMethod.method}
                    />
                )}
            </div>
        </Form>
    );
};

const PaymentMethodSubmitButtonContainer: FunctionComponent = () => {
    return <div className="submitButtonContainer" id="checkout-payment-continue" />;
};

interface PaymentMethodListFieldsetProps {
    isEmbedded?: boolean;
    isInitializingPayment?: boolean;
    isUsingMultiShipping?: boolean;
    methods: PaymentMethod[];
    values: PaymentFormValues;
    isPaymentDataRequired(): boolean;
    onMethodSelect?(method: PaymentMethod): void;
    onUnhandledError?(error: Error): void;
    resetForm(nextValues?: PaymentFormValues): void;
}

const PaymentMethodListFieldset: FunctionComponent<PaymentMethodListFieldsetProps> = ({
    isEmbedded,
    isInitializingPayment,
    isPaymentDataRequired,
    isUsingMultiShipping,
    methods,
    onMethodSelect = noop,
    onUnhandledError,
    resetForm,
    values,
}) => {
    const { setSubmitted } = useContext(FormContext);

    const commonValues = useMemo(() => ({ terms: values.terms }), [values.terms]);

    const handlePaymentMethodSelect = useCallback(
        (method: PaymentMethod) => {
            resetForm({
                ...commonValues,
                ccCustomerCode: '',
                ccCvv: '',
                ccDocument: '',
                customerEmail: '',
                customerMobile: '',
                ccExpiry: '',
                ccName: '',
                ccNumber: '',
                instrumentId: '',
                paymentProviderRadio: getUniquePaymentMethodId(method.id, method.gateway),
                shouldCreateAccount: true,
                shouldSaveInstrument: false,
                accountNumber: '',
                routingNumber: '',
            });

            setSubmitted(false);
            onMethodSelect(method);
        },
        [commonValues, onMethodSelect, resetForm, setSubmitted],
    );

    return (
        <Fieldset>
            {!isPaymentDataRequired() && <StoreCreditOverlay />}

            <PaymentMethodList
                isEmbedded={isEmbedded}
                isInitializingPayment={isInitializingPayment}
                isUsingMultiShipping={isUsingMultiShipping}
                methods={methods}
                onSelect={handlePaymentMethodSelect}
                onUnhandledError={onUnhandledError}
            />
        </Fieldset>
    );
};

const paymentFormConfig: WithFormikConfig<PaymentFormProps & WithLanguageProps, PaymentFormValues> =
    {
        mapPropsToValues: ({ defaultGatewayId, defaultMethodId }) => ({
            ccCustomerCode: '',
            ccCvv: '',
            ccDocument: '',
            customerEmail: '',
            customerMobile: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            paymentProviderRadio: getUniquePaymentMethodId(defaultMethodId, defaultGatewayId),
            instrumentId: '',
            shouldCreateAccount: true,
            shouldSaveInstrument: false,
            terms: false,
            hostedForm: {
                cardType: '',
                errors: {
                    cardCode: '',
                    cardCodeVerification: '',
                    cardExpiry: '',
                    cardName: '',
                    cardNumber: '',
                    cardNumberVerification: '',
                },
            },
            accountNumber: '',
            routingNumber: '',
        }),

        handleSubmit: (values, { props: { onSubmit = noop } }) => {
            onSubmit(
                omitBy(
                    values,
                    (value, key) => isNil(value) || value === '' || key === 'hostedForm',
                ),
            );
        },

        validationSchema: ({
            language,
            isTermsConditionsRequired = false,
            validationSchema,
        }: PaymentFormProps & WithLanguageProps) =>
            getPaymentValidationSchema({
                additionalValidation: validationSchema,
                isTermsConditionsRequired,
                language,
            }),
    };

export default withLanguage(withFormik(paymentFormConfig)(memo(PaymentForm)));
