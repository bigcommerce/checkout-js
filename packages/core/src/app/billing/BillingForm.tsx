import {
    type Address,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import { type FormikProps, withFormik } from 'formik';
import React, { type RefObject, useRef, useState } from 'react';
import { lazy } from 'yup';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton, LoadingOverlay } from '@bigcommerce/checkout/ui';

import {
  AddressForm,
  type AddressFormValues,
  AddressSelect,
  AddressType,
  getAddressFormFieldsValidationSchema,
  getTranslateAddressError,
  isValidCustomerAddress,
  mapAddressToFormValues,
} from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { OrderComments } from '../orderComments';
import { getShippableItemsCount } from '../shipping';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';

import StaticBillingAddress from './StaticBillingAddress';

export type BillingFormValues = AddressFormValues & { orderComment: string };

export interface BillingFormProps {
    methodId?: string;
    billingAddress?: Address;
    customerMessage: string;
    navigateNextStep(): void;
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    getFields(countryCode?: string): FormField[];
}

const BillingForm = ({
    methodId,
    getFields,
    billingAddress,
    setFieldValue,
    values,
    onUnhandledError,
}: BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const addressFormRef: RefObject<HTMLFieldSetElement> = useRef(null);
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();

    const { themeV2 } = useThemeContext();
    const { checkoutService, checkoutState } = useCheckout();

    const {
        data: { getCustomer, getConfig, getCart },
        statuses: { isUpdatingBillingAddress, isUpdatingCheckout },
    } = checkoutState;
    const customer = getCustomer();
    const config = getConfig();
    const cart = getCart();

    if (!config || !customer || !cart) {
        throw new Error('checkout data is not available');
    }

    const isGuest = customer.isGuest;
    const addresses = customer.addresses;
    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customFormFields = allFormFields.filter(({ custom }) => custom);
    const hasCustomFormFields = customFormFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomFormFields ? customFormFields : allFormFields;
    const billingAddresses = isGuest && isPayPalFastlaneEnabled ? paypalFastlaneAddresses : addresses;
    const hasAddresses = billingAddresses?.length > 0;
    const hasValidCustomerAddress =
        billingAddress &&
        isValidCustomerAddress(
            billingAddress,
            billingAddresses,
            getFields(billingAddress.countryCode),
        );
    const isUpdating  = isUpdatingBillingAddress() || isUpdatingCheckout();
    const { enableOrderComments } = config.checkoutSettings;
    const shouldShowOrderComments  = enableOrderComments && getShippableItemsCount(cart) < 1;

    const handleSelectAddress = async (address: Partial<Address>) => {
        setIsResettingAddress(true);

        try {
            await checkoutService.updateBillingAddress(address);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsResettingAddress(false);
        }
    };

    const handleUseNewAddress = () => {
        void handleSelectAddress({});
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
                            countryCode={values.countryCode}
                            formFields={editableFormFields}
                            setFieldValue={setFieldValue}
                            shouldShowSaveAddress={!isGuest}
                            type={AddressType.Billing}
                        />
                    </AddressFormSkeleton>
                )}
            </Fieldset>

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    className={themeV2 ? 'body-bold' : ''}
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
