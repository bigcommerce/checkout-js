import { Address, CheckoutSelectors, Consignment, Country, CustomerAddress, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { debounce, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { lazy, object } from 'yup';

import { getAddressValidationSchema, isEqualAddress, mapAddressFromFormValues, mapAddressToFormValues, AddressFormValues } from '../address';
import { withLanguage, WithLanguageProps } from '../locale';
import { Fieldset, Form } from '../ui/form';

import BillingSameAsShippingField from './shippingOption/BillingSameAsShippingField';
import hasSelectedShippingOptions from './util/hasSelectedShippingOptions';
import ShippingAddress from './ShippingAddress';
import { SHIPPING_ADDRESS_FIELDS } from './ShippingAddressFields';
import ShippingFormFooter from './ShippingFormFooter';

export interface SingleShippingFormProps {
    addresses: CustomerAddress[];
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customerMessage: string;
    googleMapsApiKey?: string;
    isLoading: boolean;
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowOrderComments: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSubmit(values: SingleShippingFormValues): void;
    onUnhandledError?(error: Error): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

export interface SingleShippingFormValues {
    billingSameAsShipping: boolean;
    shippingAddress?: AddressFormValues;
    orderComment: string;
}

interface SingleShippingFormState {
    isResettingAddress: boolean;
    isUpdatingShippingData: boolean;
}

export const SHIPPING_AUTOSAVE_DELAY = 1000;

class SingleShippingForm extends Component<SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>> {
    state: SingleShippingFormState = {
        isResettingAddress: false,
        isUpdatingShippingData: false,
    };

    private debouncedUpdateAddress: any;

    constructor(props: SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>) {
        super(props);

        const { updateAddress } = this.props;

        this.debouncedUpdateAddress = debounce(async (address: Address) => {
            try {
                await updateAddress(address);
            } finally {
                this.setState({ isUpdatingShippingData: false });
            }
        }, SHIPPING_AUTOSAVE_DELAY);
    }

    render(): ReactNode {
        const {
            addresses,
            cartHasChanged,
            isLoading,
            onUnhandledError,
            methodId,
            countries,
            countriesWithAutocomplete,
            googleMapsApiKey,
            shippingAddress,
            consignments,
            shouldShowOrderComments,
            initialize,
            isValid,
            deinitialize,
            signOut,
            values: { shippingAddress: addressForm },
        } = this.props;

        const {
            isResettingAddress,
            isUpdatingShippingData,
        } = this.state;

        return (
            <Form autoComplete="on">
                <Fieldset>
                    <ShippingAddress
                        countriesWithAutocomplete={ countriesWithAutocomplete }
                        isLoading={ isResettingAddress }
                        onUnhandledError={ onUnhandledError }
                        methodId={ methodId }
                        googleMapsApiKey={ googleMapsApiKey }
                        countries={ countries }
                        formFields={ this.getFields(addressForm && addressForm.countryCode) }
                        shippingAddress={ shippingAddress }
                        consignments={ consignments }
                        addresses={ addresses }
                        initialize={ initialize }
                        deinitialize={ deinitialize }
                        signOut={ signOut }
                        onAddressSelect={ this.handleAddressSelect }
                        onFieldChange={ this.handleFieldChange }
                        onUseNewAddress={ this.onUseNewAddress }
                    />
                    <div className="form-body">
                        <BillingSameAsShippingField />
                    </div>
                </Fieldset>

                <ShippingFormFooter
                    isMultiShippingMode={ false }
                    cartHasChanged={ cartHasChanged }
                    shouldShowOrderComments={ shouldShowOrderComments }
                    shouldShowShippingOptions={ isValid }
                    shouldDisableSubmit={ this.shouldDisableSubmit() }
                    isLoading={ isLoading || isUpdatingShippingData }
                />
            </Form>
        );
    }

    componentDidUpdate({ isValid: prevIsValid }:
        SingleShippingFormProps &
        WithLanguageProps &
        FormikProps<SingleShippingFormValues>
    ): void {
        const { isValid } = this.props;

        if (!prevIsValid && isValid) {
            this.updateAddressWithFormData();
        }
    }

    private shouldDisableSubmit: () => boolean = () => {
        const {
            isLoading,
            consignments,
            isValid,
        } = this.props;

        const {
            isUpdatingShippingData,
        } = this.state;

        if (!isValid) {
            return false;
        }

        return isLoading || isUpdatingShippingData || !hasSelectedShippingOptions(consignments);
    };

    private handleFieldChange: (name: string) => void = async name => {
        const {
            setFieldValue,
        } = this.props;

        if (name === 'countryCode') {
            setFieldValue('shippingAddress.stateOrProvince', '');
            setFieldValue('shippingAddress.stateOrProvinceCode', '');
        }

        // Enqueue the following code to run after Formik has run validation
        await new Promise(resolve => setTimeout(resolve));

        const isShippingField = SHIPPING_ADDRESS_FIELDS.includes(name);

        const { isValid } = this.props;

        if (!isValid || !isShippingField) {
            return;
        }

        this.updateAddressWithFormData();
    };

    private updateAddressWithFormData() {
        const {
            shippingAddress,
            values: { shippingAddress: addressForm },
        } = this.props;

        const updatedShippingAddress = addressForm && mapAddressFromFormValues(addressForm);

        if (!updatedShippingAddress || isEqualAddress(updatedShippingAddress, shippingAddress)) {
            return;
        }

        this.setState({ isUpdatingShippingData: true });
        this.debouncedUpdateAddress(updatedShippingAddress);
    }

    private handleAddressSelect: (
        address: Address
    ) => void = async address => {
        const {
            updateAddress,
            onUnhandledError = noop,
            values,
            setValues,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            await updateAddress(address);

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address.countryCode),
                    address
                ),
            });
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private onUseNewAddress: () => void = async () => {
        const {
            deleteConsignments,
            onUnhandledError = noop,
            setValues,
            values,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            const address = await deleteConsignments();
            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address && address.countryCode),
                    address
                ),
            });
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private getFields(countryCode: string | undefined): FormField[] {
        const {
            getFields,
        } = this.props;

        return getFields(countryCode);
    }
}

export default withLanguage(withFormik<SingleShippingFormProps & WithLanguageProps, SingleShippingFormValues>({
    handleSubmit: (values, { props: { onSubmit } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({ getFields, shippingAddress,  customerMessage }) => ({
        billingSameAsShipping: true,
        orderComment: customerMessage,
        shippingAddress: mapAddressToFormValues(
            getFields(shippingAddress && shippingAddress.countryCode),
            shippingAddress
        ),
    }),
    isInitialValid: ({
        shippingAddress,
        getFields,
        language,
    }) => (
        !!shippingAddress && getAddressValidationSchema({
            language,
            formFields: getFields(shippingAddress.countryCode),
        }).isValidSync(shippingAddress)
    ),
    validationSchema: ({
        language,
        getFields,
        methodId,
    }: SingleShippingFormProps & WithLanguageProps) => ( methodId ?
        object() :
        object({
            shippingAddress: lazy<Partial<AddressFormValues>>(formValues =>
                getAddressValidationSchema({
                    language,
                    formFields: getFields(formValues && formValues.countryCode),
                })
            ),
        })
    ),
    enableReinitialize: false,
})(SingleShippingForm));
