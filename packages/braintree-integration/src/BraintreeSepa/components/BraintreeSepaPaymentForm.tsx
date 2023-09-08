import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

// import useBraintreeSepaValidation from '../hooks/useBraintreeSepaValidation';
import useBraintreeSepaInstruments from '../hooks/useBraintreeSepaInstruments';

import BraintreeSepaFormFields from './BraintreeSepaFormFields';

interface BraintreeSepaPaymentFormProps {
    method: PaymentMethod;
}

export const BraintreeSepaPaymentForm: FunctionComponent<BraintreeSepaPaymentFormProps> = ({
  method,
}) => {
    const [isValidForm, setIsValidForm] = useState(false);
    // const { checkoutState } = useCheckout();
    const { paymentForm } = usePaymentFormContext();
    const { disableSubmit, getFieldValue, getFormValues, setFieldValue } = paymentForm;
    const {
        currentInstrument,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
        shouldConfirmInstrument,
    } = useBraintreeSepaInstruments(method);

    // const { validateBraintreeSepaForm } = useBraintreeSepaValidation();

    const resetFormValues = () => {
        // const { firstName } = checkoutState.data.getBillingAddress() || {};

        const defaultFormValues = {
            name: '',
            iban: '',
            // lastName: lastName || '',
            // shouldSetAsDefaultInstrument: false,
            // instrumentId: currentInstrument?.bigpayToken || '',
            // orderConsent: false,
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
                // const braintreeAchFormValues = getFormValues();
                // // const isValid = await validateBraintreeSepaForm(braintreeAchFormValues);
                //
                // if (!isValid) {
                //     setFieldValue('orderConsent', false);
                // }

                // setIsValidForm(isValid);
            };

            void validate();
        }
    }, [getFormValues, setFieldValue, setIsValidForm, shouldShowForm]);

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
        <div className="checkout-sepa-form" data-test="checkout-sepa-form">
            {shouldShowForm && <BraintreeSepaFormFields />}
        </div>
    );
};
