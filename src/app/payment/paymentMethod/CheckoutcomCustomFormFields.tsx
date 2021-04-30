import { BillingAddress, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { useCallback, useContext, useEffect, useState, FunctionComponent, SyntheticEvent } from 'react';

import { CheckoutContext } from '../../checkout';
import { TranslatedString } from '../../locale';
import { DropdownTrigger } from '../../ui/dropdown';
import { CheckboxFormField, FormField } from '../../ui/form';
import { TextFieldForm } from '../creditCard';
import PaymentContext from '../PaymentContext';

interface CheckoutcomAPMFormProps {
    method: PaymentMethod;
    debtor?: BillingAddress;
}
interface Issuer {
    bic: string;
    name: string;
}
interface HiddenInputProps extends FieldProps {
    selectedIssuer?: string;
}
interface DropdownButtonProps {
    selectedIssuer?: Issuer;
}
interface OptionButtonProps {
    className?: string;
    issuer: Issuer;
    onClick?(event: SyntheticEvent<EventTarget>): void;
}

interface SepaCreditor {
    sepaCreditorAddress: string;
    sepaCreditorCity: string;
    sepaCreditorCompanyName: string;
    sepaCreditorCountry: string;
    sepaCreditorIdentifier: string;
    sepaCreditorPostalCode: string;
}

const Sepa: FunctionComponent<CheckoutcomAPMFormProps> = ({method, debtor}) => {
    const checkoutContext = useContext(CheckoutContext);
    const paymentContext = useContext(PaymentContext);
    const config = checkoutContext?.checkoutState.data.getConfig();
    const creditor: SepaCreditor = method.initializationData.sepaCreditor;

    useEffect(() => {
        paymentContext?.disableSubmit(method, true);

        return () => paymentContext?.disableSubmit(method, false);
    }, [paymentContext, method]);

    function toggleSubmitButton(isChecked: boolean) {
        paymentContext?.disableSubmit(method, !isChecked);
    }

    return (<>
        <div className="checkoutcom-sepa-column-container">
            <div className="checkoutcom-sepa-column-content">
                <h4 className="checkoutcom-sepa-title">
                    <TranslatedString id="payment.checkoutcom_sepa_creditor_title" />
                </h4>
                <h5 className="checkoutcom-sepa-title">{ creditor.sepaCreditorCompanyName }</h5>
                <p className="checkoutcom-sepa-line">{ creditor.sepaCreditorAddress }</p>
                <p className="checkoutcom-sepa-line">{ `${creditor.sepaCreditorPostalCode} ${creditor.sepaCreditorCity}` }</p>
                <p className="checkoutcom-sepa-line">{ creditor.sepaCreditorCountry }</p>
                <br />
                <p className="checkoutcom-sepa-line">
                    <TranslatedString data={ {creditorId: creditor.sepaCreditorIdentifier} } id="payment.checkoutcom_sepa_creditor_id" />
                </p>
            </div>
            <div className="checkoutcom-sepa-column-content">
                <h4 className="checkoutcom-sepa-title">
                    <TranslatedString id="payment.checkoutcom_sepa_debtor_title" />
                </h4>
                <h5 className="checkoutcom-sepa-title">{ `${debtor?.firstName} ${debtor?.lastName}` }</h5>
                <p className="checkoutcom-sepa-line">{ debtor?.address1 }</p>
                <p className="checkoutcom-sepa-line">{ `${debtor?.postalCode} ${debtor?.city}, ${debtor?.stateOrProvinceCode}` }</p>
                <p className="checkoutcom-sepa-line">{ debtor?.countryCode }</p>
            </div>
        </div>
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

const Fawry: FunctionComponent<CheckoutcomAPMFormProps> = () => {
    return (
        <>
            <TextFieldForm
                additionalClassName="form-field--customerMobile"
                autoComplete="customerMobile"
                labelId="payment.checkoutcom_fawry_customer_mobile_label"
                name="tel"
            />
            <TextFieldForm
                additionalClassName="form-field--customerEmail"
                autoComplete="customerEmail"
                labelId="payment.checkoutcom_fawry_customer_email_label"
                name="email"
            />
        </>
    );
};

const Ideal: FunctionComponent<CheckoutcomAPMFormProps> = ({ method }) => {
    const [selectedIssuer, setSelectedIssuer] = useState<Issuer | undefined>();
    const [bicValue, setBicValue] = useState<string>('');
    const render = useCallback((props: FieldProps) => <HiddenInput { ...props } selectedIssuer={ bicValue } />, [bicValue]);

    const issuers: Issuer[] = method.initializationData.idealIssuers;

    const handleClick = ({ currentTarget }: SyntheticEvent<HTMLButtonElement>) => {
        const _selectedIssuer = issuers.find(({ bic }) => bic === currentTarget?.dataset.bic);
        if (!_selectedIssuer) {
            return;
        }

        setSelectedIssuer(_selectedIssuer);
        setBicValue(_selectedIssuer.bic);
    };

    const issuersList = <ul className="instrumentSelect-dropdownMenu instrumentSelect-dropdownMenuNext dropdown-menu">
        { issuers.map(issuer =>
            <li className="instrumentSelect-option dropdown-menu-item" key={ issuer.bic }>
                <OptionButton issuer={ issuer } onClick={ handleClick } />
            </li>
        ) }
    </ul>;

    return (<>
        <DropdownTrigger
            dropdown={ issuersList }
        >
            <DropdownButton selectedIssuer={ selectedIssuer } />
        </DropdownTrigger>
        <FormField input={ render } name="bic" />
    </>);
};

const HiddenInput: FunctionComponent<HiddenInputProps> = ({field: {value, ...restField}, form, selectedIssuer}) => {
    const Input = useCallback(() => <input { ...restField } type="hidden" />, [restField]);
    useEffect(() => {
        if (value === selectedIssuer) {
            return;
        }

        form.setFieldValue(restField.name, selectedIssuer);
    }, [value, form, selectedIssuer, restField.name]);

    return <Input />;
};

const DropdownButton: FunctionComponent<DropdownButtonProps> = ({ selectedIssuer }) => {
    if (!selectedIssuer) {
        return (<button
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            type="button"
        >
            <div className="instrumentSelect-details instrumentSelect-details--addNew">
                <div className="instrumentSelect-card">
                    Your bank
                </div>
            </div>
        </button>);
    }

    return (<OptionButton
        className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
        issuer={ selectedIssuer }
    />);
};

const OptionButton: FunctionComponent<OptionButtonProps> = ({ issuer, ...restProps }) => {
    const { bic, name } = issuer;

    return (<button data-bic={ bic } type="button" { ...restProps }>
        <div className="instrumentSelect-details">
            { `${bic} / ${name}` }
        </div>
    </button>);
};

const checkoutcomCustomFormFields = {
    fawry: Fawry,
    sepa: Sepa,
    ideal: Ideal,
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
