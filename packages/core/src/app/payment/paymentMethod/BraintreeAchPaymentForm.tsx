import {
    CardInstrument,
    CheckoutSelectors,
    FormField,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useEffect } from 'react';

import { AddressKeyMap } from '../../address/address';
import { ConnectFormikProps } from '../../common/form';
import { TranslatedString, WithLanguageProps } from '../../locale';
import { DynamicFormField } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';
import withAchBraintreeFields from '../withAchBraintreeFields';
import { WithPaymentProps } from '../withPayment';

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    postalCode: 'address.postal_code_label',
    stateOrProvinceCode: 'address.state_label',
    accountNumber: 'payment.account_number_label',
    routingNumber: 'payment.account_routing_label',
    businessName: 'payment.business_name_label',
    ownershipType: 'payment.ownership_type_label',
    accountType: 'payment.account_type_label'
};

export interface AchFormFieldsProps {
    handleChange: (fieldId: string) => (value: string) => void;
    fieldValues: FormField[]
}

const AchFormFields: FunctionComponent<AchFormFieldsProps> = memo(({
    handleChange,
    fieldValues
}) => (
    <>
        {fieldValues.map((field) => (
            <DynamicFormField
                extraClass={`dynamic-form-field--${field.id ?? field.name}`}
                field={field}
                key={field.id}
                label={<TranslatedString id={LABEL[field.name]} />}
                onChange={handleChange(field.id)}
                useFloatingLabel
            />
        ))}
    </>
))

export interface BraintreeAchPaymentFormProps {
    method: PaymentMethod;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrument?: CardInstrument,
    ): Promise<CheckoutSelectors>;
    mandateText: string;
    isLoadingBillingCountries: boolean;
    initializeBillingAddressFields(): Promise<CheckoutSelectors>;
}

const BraintreeAchPaymentForm: FunctionComponent<
    BraintreeAchPaymentFormProps &
    ConnectFormikProps<{ [key: string]: string }> &
    WithPaymentProps &
    WithLanguageProps &
    AchFormFieldsProps
> = ({
    mandateText,
    isLoadingBillingCountries,
    fieldValues,
    handleChange,
    ...props
}) => {
    useEffect(() => {
        const {
            method: {
                gateway: gatewayId,
                id: methodId
            },
            initializePayment,
            initializeBillingAddressFields
        } = props;

        const initialize = async () => {
            await initializeBillingAddressFields();

            await initializePayment({
                gatewayId,
                methodId,
            });
        }

        initialize();
    }, []);

    return (
        <LoadingOverlay
            hideContentWhenLoading
            isLoading={isLoadingBillingCountries}
        >
            <div className='checkout-ach-form'>
                <AchFormFields
                    fieldValues={fieldValues}
                    handleChange={handleChange}
                />
                <div className='checkout-ach-form--mandate-text'>
                    {mandateText}
                </div>
            </div>
        </LoadingOverlay>
    )
}

export default withAchBraintreeFields(BraintreeAchPaymentForm);
