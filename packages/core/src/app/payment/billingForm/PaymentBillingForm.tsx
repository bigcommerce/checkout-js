import { type Address, type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, setNestedObjectValues, withFormik } from 'formik';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton, Fieldset, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { AddressForm, AddressSelect, AddressType, isValidCustomerAddress } from '../../address';
import {
    type BillingFormValues,
    getBillingFormInitialValues,
    getBillingFormValidationSchema,
} from '../../billing/billingFormConfig';
import StaticBillingAddress from '../../billing/StaticBillingAddress';
import { OrderComments } from '../../orderComments';
import { getShippableItemsCount } from '../../shipping';
import BillingSameAsShippingField from '../../shipping/BillingSameAsShippingField';
import PaymentContext from '../PaymentContext';

// The payment-step billing form adds the "billing same as shipping" toggle on
// top of the shared billing values.
export type PaymentBillingFormValues = BillingFormValues & { billingSameAsShipping: boolean };

export interface PaymentBillingFormProps {
    methodId?: string;
    billingAddress?: Address;
    customerMessage: string;
    isLoading: boolean;
    // Default for the "billing same as shipping" toggle (from checkout settings).
    isBillingSameAsShipping: boolean;
    getFields(countryCode?: string): FormField[];
    // Persists the billing address (updateBillingAddress). Must throw on failure
    // so the pre-submit ensureBillingAddressSaved can block the order.
    onPersist(values: BillingFormValues): Promise<void>;
    onBillingSameAsShippingChange(isBillingSameAsShipping: boolean): void;
    onUnhandledError(error: Error): void;
}

const PaymentBillingFormComponent = ({
    methodId,
    getFields,
    billingAddress,
    isLoading,
    setFieldValue,
    setTouched,
    validateForm,
    values,
    onPersist,
    onBillingSameAsShippingChange,
    onUnhandledError,
}: PaymentBillingFormProps & WithLanguageProps & FormikProps<PaymentBillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    const paymentContext = useContext(PaymentContext);

    const {
        checkoutService,
        selectedState: { customer, config, cart },
    } = useCheckout(({ data }) => ({
        customer: data.getCustomer(),
        config: data.getConfig(),
        cart: data.getCart(),
    }));
    const {
        billing: { hideSaveToAddressBookCheck, restrictManualAddressEntry },
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
    const { enableOrderComments } = config.checkoutSettings;
    const shouldShowOrderComments = enableOrderComments && getShippableItemsCount(cart) < 1;
    const shouldShowSaveAddress = !hideSaveToAddressBookCheck && !isGuest;
    const shouldShowBillingSameAsShipping = !shouldRenderStaticAddress;
    const isBillingAddressCollapsed =
        shouldShowBillingSameAsShipping && values.billingSameAsShipping;

    // Ensure a pending edit is saved before the payment step places the order:
    // block while still loading, otherwise validate (surfacing errors + blocking
    // on invalid) and persist. A persist failure is reported through the billing
    // error channel and blocks the order — it must not surface as a payment
    // failure, so this never throws.
    const ensureBillingAddressSaved = useCallback(async (): Promise<boolean> => {
        if (isLoading || isResettingAddress) {
            return false;
        }

        // Collapsed "same as shipping": billing already mirrors the shipping
        // address (copied on toggle + on shipping-continue), so nothing to
        // validate or persist here. Only when the toggle is actually shown —
        // static-address methods (e.g. Amazon Pay) hide it and must still persist.
        if (shouldShowBillingSameAsShipping && values.billingSameAsShipping) {
            return true;
        }

        const errors = await validateForm();

        if (Object.keys(errors).length > 0) {
            await setTouched(setNestedObjectValues(errors, true));

            return false;
        }

        try {
            const { billingSameAsShipping: _billingSameAsShipping, ...billingValues } = values;

            await onPersist(billingValues);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }

            return false;
        }

        return true;
    }, [
        isLoading,
        isResettingAddress,
        shouldShowBillingSameAsShipping,
        validateForm,
        setTouched,
        onPersist,
        values,
        onUnhandledError,
    ]);

    useEffect(() => {
        const setEnsureBillingAddressSaved = paymentContext?.setEnsureBillingAddressSaved;

        if (!setEnsureBillingAddressSaved) {
            return;
        }

        setEnsureBillingAddressSaved(ensureBillingAddressSaved);

        return () => {
            setEnsureBillingAddressSaved(null);
        };
    }, [paymentContext, ensureBillingAddressSaved]);

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
        <div className="checkout-billing-form" data-test="checkout-billing-form">
            {shouldShowBillingSameAsShipping && (
                <BillingSameAsShippingField
                    labelStringId="billing.same_as_shipping_label"
                    onChange={onBillingSameAsShippingChange}
                />
            )}

            {/* Collapse the billing address when it mirrors shipping. */}
            {!isBillingAddressCollapsed && (
                <>
                    {shouldRenderStaticAddress && billingAddress && (
                        <div className="form-fieldset">
                            <StaticBillingAddress address={billingAddress} />
                        </div>
                    )}

                    <Fieldset id="checkoutBillingAddress">
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
                </>
            )}
        </div>
    );
};

export const PaymentBillingForm = withLanguage(
    withFormik<PaymentBillingFormProps & WithLanguageProps, PaymentBillingFormValues>({
        // No submit button — persistence happens via ensureBillingAddressSaved.
        handleSubmit: () => undefined,
        mapPropsToValues: ({
            getFields,
            customerMessage,
            billingAddress,
            isBillingSameAsShipping,
        }) => ({
            ...getBillingFormInitialValues(getFields, billingAddress, customerMessage),
            billingSameAsShipping: isBillingSameAsShipping,
        }),
        validateOnMount: true,
        validationSchema: ({
            language,
            getFields,
            methodId,
        }: PaymentBillingFormProps & WithLanguageProps) =>
            getBillingFormValidationSchema(language, getFields, methodId),
        enableReinitialize: true,
    })(PaymentBillingFormComponent),
);
