import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useEffect, useState } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

import { AccountTypes, OwnershipTypes } from '../constants';
import useBraintreeAchInstruments from '../hooks/useBraintreeAchInstruments';
import useBraintreeAchValidation from '../hooks/useBraintreeAchValidation';

import BraintreeAchFormFields from './BraintreeAchFormFields';
import BraintreeAchMandateText from './BraintreeAchMandateText';

export interface BraintreeAchPaymentFormProps {
    method: PaymentMethod;
    updateMandateText: (mandateText: string) => void;
}

const BraintreeAchPaymentForm: FunctionComponent<BraintreeAchPaymentFormProps> = ({
    method,
    updateMandateText,
}) => {
    const [isValidForm, setIsValidForm] = useState(false);
    const { checkoutState } = useCheckout();
    const { paymentForm } = usePaymentFormContext();
    const { disableSubmit, getFieldValue, getFormValues, setFieldValue } = paymentForm;
    const {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
        shouldConfirmInstrument,
    } = useBraintreeAchInstruments(method);
    const { validateBraintreeAchForm } = useBraintreeAchValidation(method);

    const resetFormValues = () => {
        const { firstName, lastName } = checkoutState.data.getBillingAddress() || {};

        const defaultFormValues = {
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '',
            routingNumber: '',
            businessName: '',
            firstName: firstName || '',
            lastName: lastName || '',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: currentInstrument?.bigpayToken || '',
            orderConsent: false,
        };

        for (const [key, value] of Object.entries(defaultFormValues)) {
            setFieldValue(key, value);
        }
    };

    useEffect(() => {
        resetFormValues();
    }, [currentInstrument?.bigpayToken]);

    const shouldShowForm =
        !shouldShowInstrumentFieldset || shouldCreateNewInstrument || shouldConfirmInstrument;
    const shouldShowMandateTextCheckbox = shouldShowForm && isValidForm && !shouldConfirmInstrument;

    useEffect(() => {
        if (shouldShowForm) {
            const validate = async () => {
                const braintreeAchFormValues = getFormValues();
                const isValid = await validateBraintreeAchForm(braintreeAchFormValues);

                if (!isValid) {
                    setFieldValue('orderConsent', false);
                }

                setIsValidForm(isValid);
            };

            void validate();
        }
    }, [getFormValues, setFieldValue, setIsValidForm, shouldShowForm, validateBraintreeAchForm]);

    useEffect(() => {
        const mandateTextConfirmationCheckboxValue = getFieldValue('orderConsent');

        const inValidForInstrumentConfirmation = shouldConfirmInstrument && !isValidForm;
        const inValidForDefaultTransactions =
            shouldShowMandateTextCheckbox && !mandateTextConfirmationCheckboxValue;

        const shouldDisableSubmit = shouldShowForm
            ? inValidForInstrumentConfirmation || inValidForDefaultTransactions
            : false;

        disableSubmit(method, shouldDisableSubmit);
    }, [disableSubmit, getFieldValue, isValidForm, method, shouldShowMandateTextCheckbox]);

    return (
        <div className="checkout-ach-form" data-test="checkout-ach-form">
            {shouldShowInstrumentFieldset && (
                <div className="checkout-ach-form__instrument">
                    <AccountInstrumentFieldset
                        instruments={accountInstruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewInstrument}
                        selectedInstrument={currentInstrument}
                    />
                </div>
            )}

            {shouldConfirmInstrument && (
                <p>
                    <strong>
                        <TranslatedString id="payment.bank_account_instrument_trusted_shipping_address_title_text" />
                    </strong>

                    <br />

                    <TranslatedString id="payment.bank_account_instrument_trusted_shipping_address_text" />
                </p>
            )}

            {shouldShowForm && <BraintreeAchFormFields />}

            {isInstrumentFeatureAvailable && (
                <StoreInstrumentFieldset
                    instrumentId={currentInstrument?.bigpayToken}
                    instruments={accountInstruments}
                    isAccountInstrument
                />
            )}

            {shouldShowMandateTextCheckbox && (
                <BraintreeAchMandateText
                    isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
                    updateMandateText={updateMandateText}
                />
            )}
        </div>
    );
};

export default BraintreeAchPaymentForm;
