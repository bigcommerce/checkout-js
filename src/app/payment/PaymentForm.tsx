import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps, WithFormikConfig } from 'formik';
import { isNil, noop, omitBy } from 'lodash';
import React, { memo, useCallback, useContext, useMemo, FunctionComponent } from 'react';
import { ObjectSchema } from 'yup';

import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { TermsConditions } from '../termsConditions';
import { Fieldset, Form, FormContext, Legend } from '../ui/form';

import { CreditCardFieldsetValues } from './creditCard';
import getPaymentValidationSchema from './getPaymentValidationSchema';
import { HostedCreditCardFieldsetValues } from './hostedCreditCard';
import { getUniquePaymentMethodId, PaymentMethodId, PaymentMethodList } from './paymentMethod';
import { CardInstrumentFieldsetValues } from './storedInstrument';
import { StoreCreditField, StoreCreditOverlay } from './storeCredit';
import PaymentRedeemables from './PaymentRedeemables';
import PaymentSubmitButton from './PaymentSubmitButton';
import SpamProtectionField from './SpamProtectionField';

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

export type PaymentFormValues = (
    CreditCardFieldsetValues & PaymentFormCommonValues |
    CardInstrumentFieldsetValues & PaymentFormCommonValues |
    HostedCreditCardFieldsetValues & PaymentFormCommonValues |
    HostedWidgetPaymentMethodValues & PaymentFormCommonValues |
    PaymentFormCommonValues
);

export interface PaymentFormCommonValues {
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    terms?: boolean;
}

export interface HostedWidgetPaymentMethodValues {
    shouldSaveInstrument: boolean;
}

const PaymentForm: FunctionComponent<PaymentFormProps & FormikProps<PaymentFormValues> & WithLanguageProps> = ({
    availableStoreCredit = 0,
    didExceedSpamLimit,
    isEmbedded,
    isInitializingPayment,
    isPaymentDataRequired,
    isTermsConditionsRequired,
    isStoreCreditApplied,
    isUsingMultiShipping,
    methods,
    onMethodSelect,
    onStoreCreditChange,
    onUnhandledError,
    resetForm,
    submitForm,
    selectedMethod,
    shouldDisableSubmit,
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

    if (shouldExecuteSpamCheck) {
        return <SpamProtectionField
            didExceedSpamLimit={ didExceedSpamLimit }
            onUnhandledError={ onUnhandledError }
        />;
    }

    return (
        <Form
            className="checkout-form"
            testId="payment-form"
        >
            { usableStoreCredit > 0 && <StoreCreditField
                availableStoreCredit={ availableStoreCredit }
                isStoreCreditApplied={ isStoreCreditApplied }
                name="useStoreCredit"
                onChange={ onStoreCreditChange }
                usableStoreCredit={ usableStoreCredit }
            /> }

            <PaymentMethodListFieldset
                isEmbedded={ isEmbedded }
                isInitializingPayment={ isInitializingPayment }
                isPaymentDataRequired={ isPaymentDataRequired }
                isUsingMultiShipping={ isUsingMultiShipping }
                methods={ methods }
                onMethodSelect={ onMethodSelect }
                onUnhandledError={ onUnhandledError }
                resetForm={ resetForm }
                submitForm={ submitForm }
                values={ values }
            />

            <PaymentRedeemables />

            { isTermsConditionsRequired && <TermsConditions
                termsConditionsText={ termsConditionsText }
                termsConditionsUrl={ termsConditionsUrl }
            /> }

            <div className="form-actions">
                <PaymentSubmitButton
                    isDisabled={ shouldDisableSubmit }
                    methodGateway={ selectedMethod && selectedMethod.gateway }
                    methodId={ selectedMethodId }
                    methodType={ selectedMethod && selectedMethod.method }
                />
            </div>
        </Form>
    );
};

interface PaymentMethodListFieldsetProps {
    isEmbedded?: boolean;
    isInitializingPayment?: boolean;
    isUsingMultiShipping?: boolean;
    methods: PaymentMethod[];
    values: PaymentFormValues;
    isPaymentDataRequired(): boolean;
    submitForm(): void;
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
    submitForm,
    resetForm,
    values,
}) => {
    const { setSubmitted } = useContext(FormContext);

    const commonValues = useMemo(
        () => ({ terms: values.terms }),
        [values.terms]
    );

    const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
        resetForm({
            ...commonValues,
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            instrumentId: '',
            paymentProviderRadio: getUniquePaymentMethodId(method.id, method.gateway),
            shouldSaveInstrument: false,
        });

        setSubmitted(false);
        onMethodSelect(method);
    }, [
        commonValues,
        onMethodSelect,
        resetForm,
        setSubmitted,
    ]);

    const legend = useMemo(() => (
        <Legend>
            <TranslatedString id="payment.payment_method_label" />
        </Legend>
    ), []);

    return (
        <Fieldset legend={ legend }>
            { !isPaymentDataRequired() && <StoreCreditOverlay /> }

            <PaymentMethodList
                isEmbedded={ isEmbedded }
                isInitializingPayment={ isInitializingPayment }
                isUsingMultiShipping={ isUsingMultiShipping }
                methods={ methods }
                onSelect={ handlePaymentMethodSelect }
                onUnhandledError={ onUnhandledError }
                submitForm={ submitForm }
            />
        </Fieldset>
    );
};

const paymentFormConfig: WithFormikConfig<PaymentFormProps & WithLanguageProps, PaymentFormValues> = {
    mapPropsToValues: ({
        defaultGatewayId,
        defaultMethodId,

    }) => ({
        ccCustomerCode: '',
        ccCvv: '',
        ccExpiry: '',
        ccName: '',
        ccNumber: '',
        paymentProviderRadio: getUniquePaymentMethodId(defaultMethodId, defaultGatewayId),
        instrumentId: '',
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
    }),

    handleSubmit: (values, { props: { onSubmit = noop } }) => {
        onSubmit(omitBy(values, (value, key) =>
            isNil(value) || value === '' || key === 'hostedForm'
        ));
    },

    validationSchema: ({
        language,
        isTermsConditionsRequired = false,
        validationSchema,
    }: PaymentFormProps & WithLanguageProps) => (
        getPaymentValidationSchema({
            additionalValidation: validationSchema,
            isTermsConditionsRequired,
            language,
        })
    ),
};

export default withLanguage(withFormik(paymentFormConfig)(memo(PaymentForm)));
