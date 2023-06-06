import { AchInstrument } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { object } from 'yup';

import {
    AccountInstrumentFieldset,
    isAchInstrument,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import {
    BraintreeAchBankAccount,
    BraintreeAchBankAccountValues,
    getBraintreeAchValidationSchema,
} from '../../validation-schemas';
import { AchFormFields } from '../AchFormFields';
import { MandateText } from '../MandateText';

import { AccountTypes, formFieldData, OwnershipTypes } from './braintreeAchPaymentFormConfig';

export interface AddressKeyMap<T = string> {
    [fieldName: string]: T;
}

interface WithUseInstrumentProps {
    handleSelectInstrument: (id: string) => void;
    handleUseNewInstrument: () => void;
    currentInstrument?: AchInstrument;
    filterTrustedInstruments: AchInstrument[];
    shouldShowInstrumentFieldset: boolean;
}

const useInstrumentProps = (
    checkoutState: PaymentMethodProps['checkoutState'],
    method: PaymentMethodProps['method'],
    setFieldValue: PaymentFormService['setFieldValue'],
    isInstrumentFeatureAvailable?: boolean,
): WithUseInstrumentProps => {
    const [currentInstrument, setCurrentInstrument] = useState<AchInstrument | undefined>();

    const currentMethodInstruments = useMemo(
        () => checkoutState.data.getInstruments(method) || [],
        [checkoutState, method],
    );

    const filterAccountInstruments = useMemo(
        (): AchInstrument[] => currentMethodInstruments.filter(isAchInstrument),
        [currentMethodInstruments],
    );

    const filterTrustedInstruments = useMemo(
        (): AchInstrument[] =>
            filterAccountInstruments.filter(({ trustedShippingAddress }) => trustedShippingAddress),
        [filterAccountInstruments],
    );

    const isNewAddress =
        filterTrustedInstruments.length === 0 && filterAccountInstruments.length > 0;

    const shouldShowInstrumentFieldset =
        Boolean(isInstrumentFeatureAvailable) &&
        (filterTrustedInstruments.length > 0 || isNewAddress);

    const getDefaultInstrument = useCallback((): AchInstrument | undefined => {
        if (filterTrustedInstruments.length === 1) {
            return filterTrustedInstruments[0];
        }

        return filterTrustedInstruments.length
            ? filterTrustedInstruments.filter(({ defaultInstrument }) => defaultInstrument)[0]
            : undefined;
    }, [filterTrustedInstruments]);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            setCurrentInstrument(find(filterTrustedInstruments, { bigpayToken: id }));
            setFieldValue('instrumentId', id);
            setFieldValue('shouldSetAsDefaultInstrument', false);
        },
        [filterTrustedInstruments, setFieldValue],
    );

    const handleUseNewInstrument = useCallback(() => {
        setCurrentInstrument(undefined);

        setFieldValue('instrumentId', '');
        setFieldValue('shouldSaveInstrument', false);
        setFieldValue('shouldSetAsDefaultInstrument', false);
    }, [setFieldValue]);

    useEffect(() => {
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [getDefaultInstrument, isInstrumentFeatureAvailable]);

    useEffect(() => {
        if (!shouldShowInstrumentFieldset) {
            setFieldValue('instrumentId', '');
        }
    }, [setFieldValue, shouldShowInstrumentFieldset]);

    return {
        currentInstrument,
        filterTrustedInstruments,
        shouldShowInstrumentFieldset,
        handleSelectInstrument,
        handleUseNewInstrument,
    };
};

export interface BraintreeAchPaymentFormProps extends Omit<PaymentMethodProps, 'onUnhandledError'> {
    outstandingBalance?: number;
    storeName?: string;
    symbol?: string;
    updateMandateText: (mandateText: string) => void;
    isInstrumentFeatureAvailable?: boolean;
}

const BraintreeAchPaymentForm: FunctionComponent<BraintreeAchPaymentFormProps> = ({
    paymentForm: { getFieldValue, setFieldValue, setValidationSchema, isSubmitted, setSubmitted },
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
    const {
        currentInstrument,
        filterTrustedInstruments,
        shouldShowInstrumentFieldset,
        handleSelectInstrument,
        handleUseNewInstrument,
    } = useInstrumentProps(checkoutState, method, setFieldValue, isInstrumentFeatureAvailable);

    const ownershipTypeValue = getFieldValue(BraintreeAchBankAccountValues.OwnershipType);
    const isBusiness = ownershipTypeValue === OwnershipTypes.Business;
    const isLoadingBillingCountries = checkoutState.statuses.isLoadingBillingCountries();
    const isLoadingInstruments = checkoutState.statuses.isLoadingInstruments();
    const isLoadingPaymentMethod = checkoutState.statuses.isLoadingPaymentMethod(method.id);

    const usCountry = checkoutState.data
        .getBillingCountries()
        ?.find((state) => state.code === 'US');

    const billingAddress = checkoutState.data.getBillingAddress();

    const provinceOptions = useMemo(
        () => usCountry?.subdivisions.map((state) => ({ value: state.code, label: state.name })),
        [usCountry],
    );

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
            address1: billingAddress.address1 || '',
            address2: billingAddress.address2 || '',
            postalCode: billingAddress.postalCode || '',
            countryCode: billingAddress.countryCode || '',
            city: billingAddress.city || '',
            stateOrProvinceCode: billingAddress.stateOrProvinceCode || '',
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
            formFieldData
                .filter(({ id }) =>
                    isBusiness
                        ? id !== BraintreeAchBankAccountValues.FirstName &&
                          id !== BraintreeAchBankAccountValues.LastName
                        : id !== BraintreeAchBankAccountValues.BusinessName,
                )
                .map((field) =>
                    field.name === BraintreeAchBankAccountValues.StateOrProvinceCode
                        ? {
                              ...field,
                              options: {
                                  items: provinceOptions,
                              },
                          }
                        : field,
                ),
        [provinceOptions, isBusiness],
    );

    const fieldDataByOwnershipType = useMemo(() => {
        const isPersonalType = ownershipTypeValue === OwnershipTypes.Personal;
        const exceptionFieldTypes: BraintreeAchBankAccount[] = [];

        if (isPersonalType) {
            exceptionFieldTypes.push(BraintreeAchBankAccountValues.BusinessName);
        } else {
            exceptionFieldTypes.push(
                BraintreeAchBankAccountValues.FirstName,
                BraintreeAchBankAccountValues.LastName,
            );
        }

        return formFieldData.filter(
            ({ id }) => !exceptionFieldTypes.includes(id as BraintreeAchBankAccount),
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
    };

    return (
        <FormContext.Provider value={{ isSubmitted: isSubmitted(), setSubmitted }}>
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={
                    isLoadingBillingCountries || isLoadingInstruments || isLoadingPaymentMethod
                }
            >
                <div className="checkout-ach-form" data-testid="checkout-ach-form">
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
