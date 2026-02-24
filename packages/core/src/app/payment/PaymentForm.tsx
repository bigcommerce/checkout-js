import { ExtensionRegion, type PaymentMethod } from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, type FormikState, withFormik, type WithFormikConfig } from 'formik';
import { isEmpty, isNil, noop, omitBy } from 'lodash';
import React, { type FunctionComponent, memo, useCallback, useContext, useMemo } from 'react';
import { type ObjectSchema } from 'yup';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext } from '@bigcommerce/checkout/ui';

import { isExperimentEnabled } from '../common/utility';
import { TermsConditions } from '../termsConditions';
import { Fieldset, Form, Legend } from '../ui/form';

import getPaymentValidationSchema from './getPaymentValidationSchema';
import { NoPaymentMethods } from './NoPaymentMethods';
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

    const { checkoutState } = useCheckout();
    const { checkoutSettings } = checkoutState.data.getConfig() ?? {};
    const isMultiCouponEnabled = isExperimentEnabled(checkoutSettings, 'CHECKOUT-9674.multi_coupon_cart_checkout', false);
    const shouldShowSubmitButtonWhenPaymentNotRequired = isExperimentEnabled(checkoutSettings, 'CHECKOUT-9729.show_submit_button_when_payment_not_required', false);
    const hideSubmitPaymentButton = shouldHidePaymentSubmitButton || (shouldShowSubmitButtonWhenPaymentNotRequired && isPaymentDataRequired() && isEmpty(methods));
    
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

            {shouldShowSubmitButtonWhenPaymentNotRequired && isEmpty(methods) && (
                isPaymentDataRequired()
                    ? <NoPaymentMethods message={<TranslatedString id="payment.payment_methods_unavailable_error" />} />
                    : <NoPaymentMethods message={<TranslatedString id="payment.payment_not_required_text" />} />
            )}

            {(!shouldShowSubmitButtonWhenPaymentNotRequired || !isEmpty(methods)) && 
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
            }

            {!isMultiCouponEnabled && <PaymentRedeemables />}

            {isTermsConditionsRequired && (
                <TermsConditions
                    termsConditionsText={termsConditionsText}
                    termsConditionsUrl={termsConditionsUrl}
                />
            )}

            <div className="form-actions">
                {hideSubmitPaymentButton ? (
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
    resetForm(nextValues?: Partial<FormikState<PaymentFormValues>>): void;
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

    const handlePaymentMethodSelect = useCallback(
        (method: PaymentMethod) => {
            const updatedValues = {
                ...values,
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
            };

            resetForm({ values: updatedValues });
            setSubmitted(false);
            onMethodSelect(method);
        },
        [values, onMethodSelect, resetForm, setSubmitted],
    );

    return (
        <Fieldset
            legend={
                <Legend>
                    <TranslatedString id="payment.payment_methods_text" />
                </Legend>
            }
        >
            {!isPaymentDataRequired() && <StoreCreditOverlay />}

            <Extension region={ExtensionRegion.PaymentPaymentMethodListBefore}/>

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
            isPaymentDataRequired,
            language,
            isTermsConditionsRequired = false,
            validationSchema,
        }: PaymentFormProps & WithLanguageProps) =>
            getPaymentValidationSchema({
                additionalValidation: validationSchema,
                isPaymentDataRequired: isPaymentDataRequired(),
                isTermsConditionsRequired,
                language,
            }),
    };

export default withLanguage(withFormik(paymentFormConfig)(memo(PaymentForm)));
