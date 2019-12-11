import { Address, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import React, { createRef, PureComponent, ReactNode, RefObject } from 'react';
import { lazy } from 'yup';

import { getAddressValidationSchema, isValidCustomerAddress, mapAddressToFormValues, AddressForm, AddressFormValues, AddressSelect } from '../address';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { OrderComments } from '../orderComments';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

export type BillingFormValues = AddressFormValues & { orderComment: string };

export interface BillingFormProps {
    billingAddress?: Address;
    customer: Customer;
    customerMessage: string;
    countries: Country[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey: string;
    isUpdating: boolean;
    shouldShowOrderComments: boolean;
    getFields(countryCode?: string): FormField[];
    onUnhandledError(error: Error): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    onSubmit(values: BillingFormValues): void;
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
            customer: { addresses },
            getFields,
            countries,
            isUpdating,
            setFieldValue,
            shouldShowOrderComments,
            values,
        } = this.props;

        const { isResettingAddress } = this.state;
        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = billingAddress &&
            isValidCustomerAddress(billingAddress, addresses, getFields(billingAddress.countryCode));

        return (
            <Form autoComplete="on">
                <Fieldset id="checkoutBillingAddress" ref={ this.addressFormRef }>
                    { hasAddresses &&
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
                                formFields={ getFields(values.countryCode) }
                                googleMapsApiKey={ googleMapsApiKey }
                                setFieldValue={ setFieldValue }
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

    private handleUseNewAddress: () => void = async () => {
        const {
            updateAddress,
            onUnhandledError,
            setValues,
            customerMessage,
            getFields,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            const { data: { getBillingAddress } } = await updateAddress({});

            const billingAddress = getBillingAddress();

            setValues({
                ...mapAddressToFormValues(
                    getFields(billingAddress && billingAddress.countryCode),
                    billingAddress
                ),
                orderComment: customerMessage,
            });
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
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
        !!billingAddress && getAddressValidationSchema({
            language,
            formFields: getFields(billingAddress.countryCode),
        }).isValidSync(billingAddress)
    ),
    validationSchema: ({
        language,
        getFields,
    }: BillingFormProps & WithLanguageProps) => (
        lazy<Partial<AddressFormValues>>(values => getAddressValidationSchema({
            language,
            formFields: getFields(values && values.countryCode),
        }))
    ),
    enableReinitialize: true,
})(BillingForm));
