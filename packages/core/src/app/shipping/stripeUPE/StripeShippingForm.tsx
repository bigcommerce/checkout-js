import {
    Address,
    CheckoutParams,
    CheckoutSelectors,
    Consignment,
    Country,
    FormField,
    RequestOptions,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';
import { lazy, object } from 'yup';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { FormContext } from '@bigcommerce/checkout/ui';

import {
    AddressFormValues,
    getAddressFormFieldsValidationSchema,
    getTranslateAddressError,
    mapAddressToFormValues,
} from '../../address';
import CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import { getCustomFormFieldsValidationSchema } from '../../formFields';
import { Fieldset, Form } from '../../ui/form';
import BillingSameAsShippingField from '../BillingSameAsShippingField';
import hasSelectedShippingOptions from '../hasSelectedShippingOptions';
import ShippingFormFooter from '../ShippingFormFooter';

import StripeShippingAddress from './StripeShippingAddress';

export interface SingleShippingFormProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    customerMessage: string;
    isLoading: boolean;
    isShippingMethodLoading: boolean;
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowOrderComments: boolean;
    step: CheckoutStepStatus;
    isStripeLoading?(): void;
    isStripeAutoStep?(): void;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSubmit(values: SingleShippingFormValues): void;
    onUnhandledError?(error: Error): void;
    updateAddress(
        address: Partial<Address>,
        options?: RequestOptions<CheckoutParams>,
    ): Promise<CheckoutSelectors>;
}

export interface SingleShippingFormValues {
    billingSameAsShipping: boolean;
    shippingAddress?: AddressFormValues;
    orderComment: string;
}

interface SingleShippingFormState {
    isUpdatingShippingData: boolean;
}

class StripeShippingForm extends PureComponent<
    SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>
    > {
    static contextType = FormContext;

    state: SingleShippingFormState = {
        isUpdatingShippingData: false,
    };

    render(): ReactNode {
        const {
            cartHasChanged,
            isLoading,
            countries,
            isStripeLoading,
            shippingAddress,
            consignments,
            shouldShowOrderComments,
            initialize,
            isValid,
            deinitialize,
            onSubmit,
            isStripeAutoStep,
            step,
            isShippingMethodLoading,
        } = this.props;

        const { isUpdatingShippingData } = this.state;

        return (
            <Form autoComplete="on">
                <Fieldset>
                    <StripeShippingAddress
                        consignments={consignments}
                        countries={countries}
                        deinitialize={deinitialize}
                        initialize={initialize}
                        isShippingMethodLoading={isShippingMethodLoading}
                        isStripeAutoStep={isStripeAutoStep}
                        isStripeLoading={isStripeLoading}
                        onAddressSelect={this.handleAddressSelect}
                        onSubmit={onSubmit}
                        shippingAddress={shippingAddress}
                        shouldDisableSubmit={this.shouldDisableSubmit()}
                        step={step}
                    />
                    <div className="form-body">
                        <BillingSameAsShippingField />
                    </div>
                </Fieldset>

                <ShippingFormFooter
                    cartHasChanged={cartHasChanged}
                    isLoading={isLoading || isUpdatingShippingData}
                    isMultiShippingMode={false}
                    shouldDisableSubmit={this.shouldDisableSubmit()}
                    shouldShowOrderComments={shouldShowOrderComments}
                    shouldShowShippingOptions={isValid}
                />
            </Form>
        );
    }

    private shouldDisableSubmit: () => boolean = () => {
        const { isLoading, consignments, isValid } = this.props;

        const { isUpdatingShippingData } = this.state;

        if (!isValid) {
            return false;
        }

        return isLoading || isUpdatingShippingData || !hasSelectedShippingOptions(consignments);
    };

    private handleAddressSelect: (address: Address) => void = async (address) => {
        const { updateAddress, onUnhandledError = noop, values, setValues } = this.props;

        try {
            await updateAddress(address);

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address.countryCode),
                    address,
                ),
            });
        } catch (error) {
            onUnhandledError(error);
        }
    };

    private getFields(countryCode: string | undefined): FormField[] {
        const { getFields } = this.props;

        return getFields(countryCode);
    }
}

export default withLanguage(
    withFormik<SingleShippingFormProps & WithLanguageProps, SingleShippingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({
                               getFields,
                               shippingAddress,
                               isBillingSameAsShipping,
                               customerMessage,
                           }) => ({
            billingSameAsShipping: isBillingSameAsShipping,
            orderComment: customerMessage,
            shippingAddress: mapAddressToFormValues(
                getFields(shippingAddress && shippingAddress.countryCode),
                shippingAddress,
            ),
        }),
        isInitialValid: ({ shippingAddress, getFields, language }) =>
            !!shippingAddress &&
            getAddressFormFieldsValidationSchema({
                language,
                formFields: getFields(shippingAddress.countryCode),
            }).isValidSync(shippingAddress),
        validationSchema: ({
                               language,
                               getFields,
                               methodId,
                           }: SingleShippingFormProps & WithLanguageProps) =>
            methodId
                ? object({
                    shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                        getCustomFormFieldsValidationSchema({
                            translate: getTranslateAddressError(language),
                            formFields: getFields(formValues && formValues.countryCode),
                        }),
                    ),
                })
                : object({
                    shippingAddress: lazy<Partial<AddressFormValues>>((formValues) =>
                        getAddressFormFieldsValidationSchema({
                            language,
                            formFields: getFields(formValues && formValues.countryCode),
                        }),
                    ),
                }),
        enableReinitialize: false,
    })(StripeShippingForm),
);
