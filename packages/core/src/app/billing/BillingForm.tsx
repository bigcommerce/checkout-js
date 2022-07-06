import { Address, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import React, { createRef, PureComponent, ReactNode, RefObject } from 'react';
import { lazy } from 'yup';

import { getAddressFormFieldsValidationSchema, getTranslateAddressError, isValidCustomerAddress, mapAddressToFormValues, AddressForm, AddressFormValues, AddressSelect } from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { OrderComments } from '../orderComments';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import StaticBillingAddress from './StaticBillingAddress';

export type BillingFormValues = AddressFormValues & { orderComment: string };

export interface BillingFormProps {
    billingAddress?: Address;
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isUpdating: boolean;
    methodId?: string;
    shouldShowOrderComments: boolean;
    getFields(countryCode?: string): FormField[];
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

interface BillingFormState {
    isResettingAddress: boolean;
}

class BillingForm extends PureComponent<BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>, BillingFormState> {
    state: BillingFormState = {
        isResettingAddress: false,
    };

    private addressFormRef: RefObject<HTMLFieldSetElement> = createRef();

    render(): ReactNode {
        const {
            googleMapsApiKey,
            billingAddress,
            countriesWithAutocomplete,
            customer: { addresses, isGuest },
            getFields,
            countries,
            isUpdating,
            setFieldValue,
            shouldShowOrderComments,
            values,
            methodId,
        } = this.props;

        const shouldRenderStaticAddress = methodId === 'amazonpay';
        const allFormFields = getFields(values.countryCode);
        const customFormFields = allFormFields.filter(({ custom }) => custom);
        const hasCustomFormFields = customFormFields.length > 0;
        const editableFormFields = shouldRenderStaticAddress && hasCustomFormFields ? customFormFields : allFormFields;
        const { isResettingAddress } = this.state;
        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = billingAddress &&
            isValidCustomerAddress(billingAddress, addresses, getFields(billingAddress.countryCode));

        return (
            <Form autoComplete="on">
                { shouldRenderStaticAddress && billingAddress &&
                    <div className={ 'form-fieldset' }>
                        <StaticBillingAddress address={ billingAddress } />
                    </div> }

                <Fieldset id="checkoutBillingAddress" ref={ this.addressFormRef }>
                    { hasAddresses && !shouldRenderStaticAddress &&
                        <Fieldset id="billingAddresses">
                            <LoadingOverlay isLoading={ isResettingAddress }>
                                <AddressSelect
                                    addresses={ addresses }
                                    onSelectAddress={ this.handleSelectAddress }
                                    onUseNewAddress={ this.handleUseNewAddress }
                                    selectedAddress={ hasValidCustomerAddress ? billingAddress : undefined }
                                />
                            </LoadingOverlay>
                        </Fieldset> }

                    { !hasValidCustomerAddress &&
                        <LoadingOverlay isLoading={ isResettingAddress }>
                            <AddressForm
                                countries={ countries }
                                countriesWithAutocomplete={ countriesWithAutocomplete }
                                countryCode={ values.countryCode }
                                formFields={ editableFormFields }
                                googleMapsApiKey={ googleMapsApiKey }
                                setFieldValue={ setFieldValue }
                                shouldShowSaveAddress={ !isGuest }
                            />
                        </LoadingOverlay> }
                </Fieldset>

                { shouldShowOrderComments &&
                    <OrderComments /> }

                <div className="form-actions">
                    <Button
                        disabled={ isUpdating || isResettingAddress }
                        id="checkout-billing-continue"
                        isLoading={ isUpdating || isResettingAddress }
                        type="submit"
                        variant={ ButtonVariant.Primary }
                    >
                        <TranslatedString id="common.continue_action" />
                    </Button>
                </div>
            </Form>
        );
    }

    private handleSelectAddress: (address: Partial<Address>) => void = async address => {
        const {
            updateAddress,
            onUnhandledError,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            await updateAddress(address);
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private handleUseNewAddress: () => void = () => {
        this.handleSelectAddress({});
    };
}

export default withLanguage(withFormik<BillingFormProps & WithLanguageProps, BillingFormValues>({
    handleSubmit: (values, { props: { onSubmit } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({ getFields, customerMessage, billingAddress }) => (
        {
        ...mapAddressToFormValues(
            getFields(billingAddress && billingAddress.countryCode),
            billingAddress
        ),
        orderComment: customerMessage,
    }),
    isInitialValid: ({
        billingAddress,
        getFields,
        language,
    }) => (
        !!billingAddress && getAddressFormFieldsValidationSchema({
            language,
            formFields: getFields(billingAddress.countryCode),
        }).isValidSync(billingAddress)
    ),
    validationSchema: ({
        language,
        getFields,
        methodId,
    }: BillingFormProps & WithLanguageProps) => methodId === 'amazonpay' ?
        (lazy<Partial<AddressFormValues>>(values => getCustomFormFieldsValidationSchema({
            translate: getTranslateAddressError(language),
            formFields: getFields(values && values.countryCode),
        }))) :
        (lazy<Partial<AddressFormValues>>(values => getAddressFormFieldsValidationSchema({
            language,
            formFields: getFields(values && values.countryCode),
        }))),
    enableReinitialize: true,
})(BillingForm));
