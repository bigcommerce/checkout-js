import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { object } from 'yup';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { BraintreeAchFieldType, getBraintreeAchValidationSchema } from '../../validation-schemas';
import { AchFormFields } from '../AchFormFields';
import { MandateText } from '../MandateText';

import { AccountTypes, formFieldData, OwnershipTypes } from './braintreeAchPaymentFormConfig';
import useInstrumentProps from './useInstrumentProps';

export interface AddressKeyMap<T = string> {
    [fieldName: string]: T;
}

export interface BraintreeAchPaymentFormProps extends Omit<PaymentMethodProps, 'onUnhandledError'> {
    outstandingBalance?: number;
    storeName?: string;
    symbol?: string;
    updateMandateText: (mandateText: string) => void;
    isInstrumentFeatureAvailable?: boolean;
}

const BraintreeAchPaymentForm: FunctionComponent<BraintreeAchPaymentFormProps> = ({
    paymentForm: {
        getFieldValue,
        setFieldValue,
        setValidationSchema,
        isSubmitted,
        setSubmitted,
        disableSubmit,
    },
    paymentForm,
    outstandingBalance,
    symbol,
    storeName,
    checkoutState,
    checkoutService,
    method,
    language,
    updateMandateText,
    isInstrumentFeatureAvailable,
}) => {
    const [disabled, setDisabled] = useState(false);

    const onOrderConsentChange = useCallback(
        (orderConsent: boolean) => setDisabled(!orderConsent),
        [setDisabled],
    );

    const {
        currentInstrument,
        filterTrustedInstruments,
        shouldShowInstrumentFieldset,
        handleSelectInstrument,
        handleUseNewInstrument,
    } = useInstrumentProps(checkoutState, method, setFieldValue, isInstrumentFeatureAvailable);

    const ownershipTypeValue = getFieldValue(BraintreeAchFieldType.OwnershipType);
    const isBusiness = ownershipTypeValue === OwnershipTypes.Business;
    const isLoadingInstruments = checkoutState.statuses.isLoadingInstruments();
    const isLoadingPaymentMethod = checkoutState.statuses.isLoadingPaymentMethod(method.id);

    const billingAddress = checkoutState.data.getBillingAddress();

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
        },
        [setFieldValue],
    );

    const setFormValues = useCallback(() => {
        if (!billingAddress) return;

        const formValues = {
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '',
            routingNumber: '',
            businessName: '',
            firstName: billingAddress.firstName || '',
            lastName: billingAddress.lastName || '',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
        };

        for (const [key, value] of Object.entries(formValues)) {
            setFieldValue(key, value);
        }
    }, [billingAddress, setFieldValue]);

    useEffect(() => {
        setFormValues();
    }, [setFormValues]);

    const formData = useMemo(
        () =>
            formFieldData.filter(({ id }) =>
                isBusiness
                    ? id !== BraintreeAchFieldType.FirstName &&
                      id !== BraintreeAchFieldType.LastName
                    : id !== BraintreeAchFieldType.BusinessName,
            ),
        [isBusiness],
    );

    const fieldDataByOwnershipType = useMemo(() => {
        const isPersonalType = ownershipTypeValue === OwnershipTypes.Personal;
        const exceptionFieldTypes: BraintreeAchFieldType[] = [];

        if (isPersonalType) {
            exceptionFieldTypes.push(BraintreeAchFieldType.BusinessName);
        } else {
            exceptionFieldTypes.push(
                BraintreeAchFieldType.FirstName,
                BraintreeAchFieldType.LastName,
            );
        }

        return formFieldData.filter(
            ({ id }) => !exceptionFieldTypes.includes(id as BraintreeAchFieldType),
        );
    }, [ownershipTypeValue]);

    const validationSchema = useMemo(
        () =>
            !currentInstrument
                ? getBraintreeAchValidationSchema({
                      formFieldData: fieldDataByOwnershipType,
                      language,
                  })
                : object({}),
        [currentInstrument, fieldDataByOwnershipType, language],
    );

    useEffect(() => {
        setSubmitted(false);
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema, setSubmitted]);

    useEffect(() => disableSubmit(method, disabled), [disableSubmit, disabled, method]);

    const mandateTextProps = {
        getFieldValue,
        isBusiness,
        language,
        outstandingBalance,
        updateMandateText,
        storeName,
        symbol,
        validationSchema,
        isInstrumentFeatureAvailable,
        onOrderConsentChange,
        setFieldValue,
    };

    const isLoading = isLoadingInstruments || isLoadingPaymentMethod;

    return (
        <FormContext.Provider value={{ isSubmitted: isSubmitted(), setSubmitted }}>
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <div className="checkout-ach-form" data-test="checkout-ach-form">
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        {shouldShowInstrumentFieldset && (
                            <div className="checkout-ach-form__instrument">
                                <AccountInstrumentFieldset
                                    instruments={filterTrustedInstruments}
                                    onSelectInstrument={handleSelectInstrument}
                                    onUseNewInstrument={handleUseNewInstrument}
                                    selectedInstrument={currentInstrument}
                                />
                            </div>
                        )}
                        {!currentInstrument && (
                            <AchFormFields
                                fieldValues={formData}
                                handleChange={handleChange}
                                language={language}
                            />
                        )}
                        {isInstrumentFeatureAvailable && (
                            <PaymentFormContext.Provider value={{ paymentForm }}>
                                <StoreInstrumentFieldset
                                    instrumentId={currentInstrument?.bigpayToken}
                                    isAccountInstrument
                                />
                            </PaymentFormContext.Provider>
                        )}
                    </CheckoutContext.Provider>
                    <MandateText {...mandateTextProps} />
                </div>
            </LoadingOverlay>
        </FormContext.Provider>
    );
};

export default BraintreeAchPaymentForm;
