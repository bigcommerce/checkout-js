import {
    type Address,
    type CustomerAddress,
    type FormField,
    isExtraField,
} from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, withFormik } from 'formik';
import React, { type RefObject, useEffect, useRef, useState } from 'react';
import { lazy } from 'yup';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import {
    TranslatedString,
    withLanguage,
    type WithLanguageProps,
} from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import {
    AddressFormSkeleton,
    Button,
    ButtonVariant,
    Fieldset,
    Form,
    LoadingOverlay,
} from '@bigcommerce/checkout/ui';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

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
import {
    getAddressExtraFieldsValidationSchema,
    getCustomFormFieldsValidationSchema,
} from '../formFields';
import { OrderComments } from '../orderComments';
import { getShippableItemsCount } from '../shipping';

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

    const {
        checkoutService,
        selectedState: { customer, config, cart, isUpdatingBillingAddress, isUpdatingCheckout },
    } = useCheckout(({ data, statuses }) => ({
        customer: data.getCustomer(),
        config: data.getConfig(),
        cart: data.getCart(),
        isUpdatingBillingAddress: statuses.isUpdatingBillingAddress(),
        isUpdatingCheckout: statuses.isUpdatingCheckout(),
    }));
    const {
        billing: { hideSaveToAddressBookCheck, restrictManualAddressEntry },
        userJourney: { hasAddressExtraFields, hasCompanyAddressBook },
    } = useCapabilities();

    if (!config || !customer || !cart) {
        throw new Error('checkout data is not available');
    }

    const isGuest = customer.isGuest;
    const addresses = customer.addresses;
    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customOrExtraFields = allFormFields.filter(
        (field) => field.custom || isExtraField(field),
    );
    const hasCustomOrExtraFields = customOrExtraFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomOrExtraFields ? customOrExtraFields : allFormFields;
    const billingAddresses =
        isGuest && isPayPalFastlaneEnabled ? paypalFastlaneAddresses : addresses;
    const hasAddresses = billingAddresses?.length > 0;
    const hasValidCustomerAddress =
        billingAddress &&
        isValidCustomerAddress(
            billingAddress,
            billingAddresses,
            getFields(billingAddress.countryCode),
        );
    const isUpdating = isUpdatingBillingAddress || isUpdatingCheckout;
    const { enableOrderComments } = config.checkoutSettings;
    const shouldShowOrderComments = enableOrderComments && getShippableItemsCount(cart) < 1;
    const shouldShowSaveAddress = !hideSaveToAddressBookCheck && !isGuest;

    // Once the address form opens (selected address is invalid or no longer matches a
    // book entry), the stored book id can't faithfully represent it, so drop it.
    useEffect(() => {
        if (
            hasCompanyAddressBook &&
            !hasValidCustomerAddress &&
            B2BSessionStorage.getAddressId(B2BSessionStorage.billingAddressIdKey)
        ) {
            B2BSessionStorage.remove(B2BSessionStorage.billingAddressIdKey);
        }
    }, [hasCompanyAddressBook, hasValidCustomerAddress]);

    const handleSelectAddress = async (address: Partial<Address>) => {
        setIsResettingAddress(true);

        try {
            await checkoutService.updateBillingAddress(address);

            B2BSessionStorage.remove(B2BSessionStorage.billingAddressIdKey);

            const selectedAddressId = (address as CustomerAddress).id;

            if (hasCompanyAddressBook && selectedAddressId) {
                B2BSessionStorage.set(B2BSessionStorage.billingAddressIdKey, selectedAddressId);
            }
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsResettingAddress(false);
        }
    };

    const handleUseNewAddress = () => {
        if (hasAddressExtraFields) {
            B2BSessionStorage.remove(B2BSessionStorage.billingExtraFieldsKey);
        }

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

                {!restrictManualAddressEntry && !hasValidCustomerAddress && (
                    <AddressFormSkeleton isLoading={isResettingAddress}>
                        <AddressForm
                            countryCode={values.countryCode}
                            formFields={editableFormFields}
                            setFieldValue={setFieldValue}
                            shouldShowSaveAddress={shouldShowSaveAddress}
                            type={AddressType.Billing}
                        />
                    </AddressFormSkeleton>
                )}
            </Fieldset>

            {shouldShowOrderComments && <OrderComments />}

            <div className="form-actions">
                <Button
                    className="body-bold"
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
                B2BSessionStorage.billingExtraFieldsKey,
            ),
            orderComment: customerMessage,
        }),
        validateOnMount: true,
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: BillingFormProps & WithLanguageProps) =>
            methodId === 'amazonpay'
                ? lazy<Partial<AddressFormValues>>((values) => {
                      const translate = getTranslateAddressError(
                          getFields(values && values.countryCode),
                          language,
                      );

                      return getCustomFormFieldsValidationSchema({
                          translate,
                          formFields: getFields(values && values.countryCode),
                      }).concat(
                          getAddressExtraFieldsValidationSchema({
                              translate,
                              formFields: getFields(values && values.countryCode),
                          }),
                      );
                  })
                : lazy<Partial<AddressFormValues>>((values) =>
                      getAddressFormFieldsValidationSchema({
                          language,
                          formFields: getFields(values && values.countryCode),
                      }),
                  ),
        enableReinitialize: true,
    })(BillingForm),
);
