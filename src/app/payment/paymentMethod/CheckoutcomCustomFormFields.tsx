import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { useContext, useEffect, FunctionComponent } from 'react';

import { CheckoutContext } from '../../checkout';
import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';
import { TextFieldForm } from '../creditCard';
import PaymentContext from '../PaymentContext';

interface CheckoutcomAPMFormProps {
    method: PaymentMethod;
}

const Sepa: FunctionComponent<CheckoutcomAPMFormProps> = ({method}) => {
    const checkoutContext = useContext(CheckoutContext);
    const paymentContext = useContext(PaymentContext);
    const config = checkoutContext?.checkoutState.data.getConfig();

    useEffect(() => {
        paymentContext?.disableSubmit(method, true);

        return () => paymentContext?.disableSubmit(method, false);
    }, [paymentContext, method]);

    function toggleSubmitButton(isChecked: boolean) {
        paymentContext?.disableSubmit(method, !isChecked);
    }

    return (<>
        <TextFieldForm
            additionalClassName="form-field--iban"
            autoComplete="iban"
            labelId="payment.sepa_account_number"
            name="iban"
        />
        <TextFieldForm
            additionalClassName="form-field--bic"
            autoComplete="bic"
            labelId="payment.sepa_bic"
            name="bic"
        />
        <CheckboxFormField
            labelContent={
                <TranslatedString data={ {storeName: config?.storeProfile.storeName} } id="payment.checkoutcom_sepa_mandate_disclaimer" />
            }
            name="sepaMandate"
            onChange={ toggleSubmitButton }
        />
    </>);
};

const checkoutcomCustomFormFields = {
    sepa: Sepa,
};

export const ccDocumentField = ({ method }: CheckoutcomAPMFormProps) => (
    <TextFieldForm
        additionalClassName="form-field--ccDocument"
        autoComplete="cc-document"
        labelId={ `payment.checkoutcom_document_label_${ method.id }` }
        name="ccDocument"
    />
);

export default checkoutcomCustomFormFields;
