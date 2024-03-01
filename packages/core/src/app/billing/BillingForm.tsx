import {
    Address,
    CheckoutSelectors,
    Country,
    Customer,
    FormField,
} from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import React, { RefObject, useRef, useState } from 'react';
import { lazy } from 'yup';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import {
    AddressForm,
    AddressFormValues,
    AddressSelect,
    AddressType,
    getAddressFormFieldsValidationSchema,
    getTranslateAddressError,
    isValidCustomerAddress,
    mapAddressToFormValues,
} from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
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
    isFloatingLabelEnabled?: boolean;
    getFields(countryCode?: string): FormField[];
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

const BillingForm = ({
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
    isFloatingLabelEnabled,
    updateAddress,
    onUnhandledError,
}: BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const addressFormRef: RefObject<HTMLFieldSetElement> = useRef(null);
    const { isPayPalFastlaneEnabled, mergedBcAndPayPalFastlaneAddresses } = usePayPalFastlaneAddress();

    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customFormFields = allFormFields.filter(({ custom }) => custom);
    const hasCustomFormFields = customFormFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomFormFields ? customFormFields : allFormFields;
    const billingAddresses = isPayPalFastlaneEnabled ? mergedBcAndPayPalFastlaneAddresses : addresses;
    const hasAddresses = billingAddresses?.length > 0;
    const hasValidCustomerAddress =
        billingAddress &&
        isValidCustomerAddress(
            billingAddress,
            billingAddresses,
            getFields(billingAddress.countryCode),
        );

    const handleSelectAddress = async (address: Partial<Address>) => {
        setIsResettingAddress(true);

        try {
            await updateAddress(address);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsResettingAddress(false);
        }
    };

    const handleUseNewAddress = () => {
        handleSelectAddress({});
    };

    return (
        <Form autoComplete="on">
            {shouldRenderStaticAddress && billingAddress && (
                <div className="form-fieldset">
                    <StaticBillingAddress address={billingAddress} />
                </div>
            )}

            <Fieldset id="checkoutBillingAddress" ref={addressFormRef}>
                {hasAddresses && !shouldRenderStaticAddress && (
                    <Fieldset id="billingAddresses">
                        <LoadingOverlay isLoading={isResettingAddress}>
                            <AddressSelect
                                addresses={billingAddresses}
                                onSelectAddress={handleSelectAddress}
                                onUseNewAddress={handleUseNewAddress}
                                selectedAddress={
                                    hasValidCustomerAddress ? billingAddress : undefined
                                }
                                type={AddressType.Billing}
                            />
                        </LoadingOverlay>
                    </Fieldset>
                )}

                {!hasValidCustomerAddress && (
                    <AddressFormSkeleton isLoading={isResettingAddress}>
                        <AddressForm
                            countries={countries}
                            countriesWithAutocomplete={countriesWithAutocomplete}
                            countryCode={values.countryCode}
                            formFields={editableFormFields}
                            googleMapsApiKey={googleMapsApiKey}
                            isFloatingLabelEnabled={isFloatingLabelEnabled}
                            setFieldValue={setFieldValue}
                            shouldShowSaveAddress={!isGuest}
                        />
                    </AddressFormSkeleton>
                )}
            </Fieldset>

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    disabled={isUpdating || isResettingAddress}
                    id="checkout-billing-continue"
                    isLoading={isUpdating || isResettingAddress}
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="common.continue_action" />
                </Button>
            </div>
        </Form>
    );
};

export default withLanguage(
    withFormik<BillingFormProps & WithLanguageProps, BillingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ getFields, customerMessage, billingAddress }) => ({
            ...mapAddressToFormValues(
                getFields(billingAddress && billingAddress.countryCode),
                billingAddress,
            ),
            orderComment: customerMessage,
        }),
        isInitialValid: ({ billingAddress, getFields, language }) =>
            !!billingAddress &&
            getAddressFormFieldsValidationSchema({
                language,
                formFields: getFields(billingAddress.countryCode),
            }).isValidSync(billingAddress),
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: BillingFormProps & WithLanguageProps) =>
            methodId === 'amazonpay'
                ? lazy<Partial<AddressFormValues>>((values) =>
                      getCustomFormFieldsValidationSchema({
                          translate: getTranslateAddressError(language),
                          formFields: getFields(values && values.countryCode),
                      }),
                  )
                : lazy<Partial<AddressFormValues>>((values) =>
                      getAddressFormFieldsValidationSchema({
                          language,
                          formFields: getFields(values && values.countryCode),
                      }),
                  ),
        enableReinitialize: true,
    })(BillingForm),
);
