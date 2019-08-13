import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps, WithFormikConfig } from 'formik';
import { noop } from 'lodash';
import React, { memo, useCallback, useContext, useMemo, Fragment, FunctionComponent } from 'react';
import { ObjectSchema } from 'yup';

import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Fieldset, Form, FormContext, Legend } from '../ui/form';

import { CreditCardFieldsetValues } from './creditCard';
import getPaymentValidationSchema from './getPaymentValidationSchema';
import { getUniquePaymentMethodId, PaymentMethodList } from './paymentMethod';
import { InstrumentFieldsetValues } from './storedInstrument';
import { StoreCreditField, StoreCreditOverlay } from './storeCredit';
import PaymentRedeemables from './PaymentRedeemables';
import PaymentSubmitButton from './PaymentSubmitButton';
import SpamProtectionField from './SpamProtectionField';
import TermsConditionsField, { TermsConditionsType } from './TermsConditionsField';

export interface PaymentFormProps {
    availableStoreCredit?: number;
    defaultGatewayId?: string;
    defaultMethodId: string;
    isEmbedded?: boolean;
    isInitializingCustomer?: boolean;
    isInitializingPayment?: boolean;
    isSpamProtectionEnabled?: boolean;
    isSubmittingOrder?: boolean;
    isTermsConditionsRequired?: boolean;
    isUsingMultiShipping?: boolean;
    methods: PaymentMethod[];
    selectedMethod?: PaymentMethod;
    shouldShowStoreCredit?: boolean;
    shouldDisableSubmit?: boolean;
    termsConditionsText?: string;
    termsConditionsUrl?: string;
    usableStoreCredit?: number;
    validationSchema?: ObjectSchema<Partial<PaymentFormValues>>;
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    onMethodSelect?(method: PaymentMethod): void;
    onStoreCreditChange?(useStoreCredit?: boolean): void;
    onSubmit?(values: PaymentFormValues): void;
    onUnhandledError?(error: Error): void;
}

export type PaymentFormValues = (
    CreditCardFieldsetValues & PaymentFormCommonValues |
    InstrumentFieldsetValues & PaymentFormCommonValues |
    HostedWidgetPaymentMethodValues & PaymentFormCommonValues |
    PaymentFormCommonValues
);

export interface PaymentFormCommonValues {
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    terms?: boolean;
    useStoreCredit?: boolean;
}

export interface HostedWidgetPaymentMethodValues {
    shouldSaveInstrument: boolean;
}

export function isCreditCardFieldsetValues(values: PaymentFormValues): values is CreditCardFieldsetValues & PaymentFormCommonValues {
    const ccValues = values as CreditCardFieldsetValues;

    return !!ccValues.ccName || !!ccValues.ccExpiry;
}

export function isInstrumentFieldsetValues(values: PaymentFormValues): values is InstrumentFieldsetValues & PaymentFormCommonValues {
    const instrumentValues = values as InstrumentFieldsetValues;

    return !!instrumentValues.instrumentId;
}

export function isHostedWidgetValues(values: PaymentFormValues): values is HostedWidgetPaymentMethodValues & PaymentFormCommonValues {
    const hostedWidgetValues = values as HostedWidgetPaymentMethodValues;

    return hostedWidgetValues.shouldSaveInstrument;
}

const PaymentForm: FunctionComponent<PaymentFormProps & FormikProps<PaymentFormValues> & WithLanguageProps> = ({
    availableStoreCredit = 0,
    isEmbedded,
    isInitializingCustomer,
    isInitializingPayment,
    isPaymentDataRequired,
    isSubmittingOrder,
    isSpamProtectionEnabled,
    isTermsConditionsRequired,
    isUsingMultiShipping,
    methods,
    onMethodSelect = noop,
    onStoreCreditChange,
    onUnhandledError,
    resetForm,
    selectedMethod,
    shouldDisableSubmit,
    termsConditionsText = '',
    termsConditionsUrl,
    usableStoreCredit = 0,
    values,
}) => {
    const { setSubmitted } = useContext(FormContext);
    const commonValues = useMemo(
        () => ({ terms: values.terms, useStoreCredit: values.useStoreCredit }),
        [values.terms, values.useStoreCredit]
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

    return <Form
        className="checkout-form"
        testId="payment-form"
    >
        { usableStoreCredit > 0 && isPaymentDataRequired() && <StoreCreditField
            availableStoreCredit={ availableStoreCredit }
            name="useStoreCredit"
            onChange={ onStoreCreditChange }
            usableStoreCredit={ usableStoreCredit }
        /> }

        <Fieldset legend={
            <Legend>
                <TranslatedString id="payment.payment_method_label" />
            </Legend>
        }>
            { !isPaymentDataRequired(values.useStoreCredit) && <StoreCreditOverlay /> }

            <PaymentMethodList
                isEmbedded={ isEmbedded }
                isUsingMultiShipping={ isUsingMultiShipping }
                methods={ methods }
                onSelect={ handlePaymentMethodSelect }
                onUnhandledError={ onUnhandledError }
            />
        </Fieldset>

        <PaymentRedeemables />

        { isTermsConditionsRequired && <Fragment>
            { termsConditionsUrl ?
                <TermsConditionsField
                    name="terms"
                    type={ TermsConditionsType.Link }
                    url={ termsConditionsUrl }
                /> :
                <TermsConditionsField
                    name="terms"
                    type={ TermsConditionsType.TextArea }
                    terms={ termsConditionsText }
                /> }
        </Fragment> }

        { isSpamProtectionEnabled && <SpamProtectionField containerId="spamProtection" /> }

        <div className="form-actions">
            <PaymentSubmitButton
                isDisabled={
                    isInitializingCustomer ||
                    isInitializingPayment ||
                    isSubmittingOrder ||
                    shouldDisableSubmit
                }
                isLoading={ isSubmittingOrder }
                methodId={ selectedMethod && selectedMethod.id }
                methodType={ selectedMethod && selectedMethod.method }
            />
        </div>
    </Form>;
};

const paymentFormConfig: WithFormikConfig<PaymentFormProps & WithLanguageProps, PaymentFormValues> = {
    mapPropsToValues: ({
        defaultGatewayId,
        defaultMethodId,
        usableStoreCredit = 0,
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
        useStoreCredit: usableStoreCredit > 0,
    }),

    handleSubmit: (values, { props: { onSubmit = noop } }) => {
        const commonValues = {
            paymentProviderRadio: values.paymentProviderRadio,
            terms: values.terms || undefined,
            useStoreCredit: values.useStoreCredit || undefined,
        };

        // Convert values of optional fields into `undefined` as Formik fields
        // always have an initial value.
        if (isCreditCardFieldsetValues(values)) {
            onSubmit({
                ...commonValues,
                ccCustomerCode: values.ccCustomerCode || undefined,
                ccCvv: values.ccCvv || undefined,
                ccExpiry: values.ccExpiry,
                ccName: values.ccName,
                ccNumber: values.ccNumber,
                shouldSaveInstrument: values.shouldSaveInstrument,
            });
        } else if (isInstrumentFieldsetValues(values)) {
            onSubmit({
                ...commonValues,
                ccNumber: values.ccNumber || undefined,
                ccCvv: values.ccCvv || undefined,
                instrumentId: values.instrumentId,
            });
        } else if (isHostedWidgetValues(values)) {
            onSubmit({
                ...commonValues,
                shouldSaveInstrument: values.shouldSaveInstrument,
            });
        } else {
            onSubmit(commonValues);
        }
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
