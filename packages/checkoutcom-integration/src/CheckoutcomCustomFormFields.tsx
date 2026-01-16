import { type BillingAddress, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useContext, useEffect } from 'react';

import { PaymentFormContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';

import TextFieldForm from './checkoutcomFieldsets/TextFieldForm';

interface CheckoutcomAPMFormProps {
    method: PaymentMethod;
    debtor: BillingAddress;
}

interface SepaCreditor {
    sepaCreditorAddress: string;
    sepaCreditorCity: string;
    sepaCreditorCompanyName: string;
    sepaCreditorCountry: string;
    sepaCreditorIdentifier: string;
    sepaCreditorPostalCode: string;
}

const Sepa: FunctionComponent<CheckoutcomAPMFormProps> = ({ method, debtor }) => {
    const paymentContext = useContext(PaymentFormContext);
    const creditor: SepaCreditor = method.initializationData.sepaCreditor;

    useEffect(() => {
        paymentContext?.paymentForm.disableSubmit(method, true);

        return () => paymentContext?.paymentForm.disableSubmit(method, false);
    }, [paymentContext, method]);

    function toggleSubmitButton(isChecked: boolean) {
        paymentContext?.paymentForm.disableSubmit(method, !isChecked);
    }

    return (
        <>
            <div className="checkoutcom-sepa-column-container">
                <div className="checkoutcom-sepa-column-content">
                    <h4 className="checkoutcom-sepa-title">
                        <TranslatedString id="payment.checkoutcom_sepa_creditor_title" />
                    </h4>
                    <h5 className="checkoutcom-sepa-title">{creditor.sepaCreditorCompanyName}</h5>
                    <p className="checkoutcom-sepa-line">{creditor.sepaCreditorAddress}</p>
                    <p className="checkoutcom-sepa-line">{`${creditor.sepaCreditorPostalCode} ${creditor.sepaCreditorCity}`}</p>
                    <p className="checkoutcom-sepa-line">{creditor.sepaCreditorCountry}</p>
                    <br />
                    <p className="checkoutcom-sepa-line">
                        <TranslatedString
                            data={{ creditorId: creditor.sepaCreditorIdentifier }}
                            id="payment.checkoutcom_sepa_creditor_id"
                        />
                    </p>
                </div>
                <div className="checkoutcom-sepa-column-content">
                    <h4 className="checkoutcom-sepa-title">
                        <TranslatedString id="payment.checkoutcom_sepa_debtor_title" />
                    </h4>
                    <h5 className="checkoutcom-sepa-title">{`${debtor.firstName} ${debtor.lastName}`}</h5>
                    <p className="checkoutcom-sepa-line">{debtor.address1}</p>
                    <p className="checkoutcom-sepa-line">{`${debtor.postalCode} ${debtor.city}, ${debtor.stateOrProvinceCode}`}</p>
                    <p className="checkoutcom-sepa-line">{debtor.countryCode}</p>
                </div>
            </div>
            <p className="checkoutcom-sepa-line">
                <TranslatedString id="payment.checkoutcom_sepa_payment_type" />
            </p>
            <br />

            <TextFieldForm
                additionalClassName="form-field--iban"
                autoComplete="iban"
                labelId="payment.sepa_account_number"
                name="iban"
            />
            <CheckboxFormField
                labelContent={
                    <TranslatedString
                        data={{ creditorName: creditor.sepaCreditorCompanyName }}
                        id="payment.checkoutcom_sepa_mandate_disclaimer"
                    />
                }
                name="sepaMandate"
                // eslint-disable-next-line react/jsx-no-bind
                onChange={toggleSubmitButton}
            />
        </>
    );
};

const Fawry: FunctionComponent<CheckoutcomAPMFormProps> = () => {
    return (
        <>
            <TextFieldForm
                additionalClassName="form-field--customerMobile"
                autoComplete="tel"
                labelId="payment.checkoutcom_fawry_customer_mobile_label"
                name="customerMobile"
            />
            <TextFieldForm
                additionalClassName="form-field--customerEmail"
                autoComplete="email"
                labelId="payment.checkoutcom_fawry_customer_email_label"
                name="customerEmail"
            />
        </>
    );
};

const checkoutcomCustomFormFields: CheckoutcomCustomFormFields = {
    fawry: Fawry,
    sepa: Sepa,
};

interface CheckoutcomCustomFormFields {
    [key: string]: React.FunctionComponent<CheckoutcomAPMFormProps>;
}

export const ccDocumentField = ({ method }: CheckoutcomAPMFormProps) => (
    <TextFieldForm
        additionalClassName="form-field--ccDocument"
        autoComplete="cc-document"
        labelId={`payment.checkoutcom_document_label_${method.id}`}
        name="ccDocument"
    />
);

export default checkoutcomCustomFormFields;
