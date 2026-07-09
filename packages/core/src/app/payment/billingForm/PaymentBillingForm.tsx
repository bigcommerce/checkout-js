import { type Address, type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, setNestedObjectValues, withFormik } from 'formik';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton, Fieldset, LoadingOverlay } from '@bigcommerce/checkout/ui';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { AddressForm, AddressSelect, AddressType, isValidCustomerAddress } from '../../address';
import {
    type BillingFormValues,
    getBillingFormInitialValues,
    getBillingFormValidationSchema,
} from '../../billing/billingFormConfig';
import StaticBillingAddress from '../../billing/StaticBillingAddress';
import { OrderComments } from '../../orderComments';
import { getShippableItemsCount } from '../../shipping';
import PaymentContext from '../PaymentContext';

export interface PaymentBillingFormProps {
    methodId?: string;
    billingAddress?: Address;
    customerMessage: string;
    isLoading: boolean;
    getFields(countryCode?: string): FormField[];
    // Persists the billing address (updateBillingAddress). Must throw on failure
    // so the pre-submit ensureBillingAddressSaved can block the order.
    onPersist(values: BillingFormValues): Promise<void>;
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
    onUnhandledError,
}: PaymentBillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>) => {
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
        userJourney: { hasAddressExtraFields },
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

    // Ensure a pending edit is saved before the payment step places the order:
    // block while still loading, otherwise validate (surfacing errors + blocking
    // on invalid) and persist. A persist failure is reported through the billing
    // error channel and blocks the order — it must not surface as a payment
    // failure, so this never throws.
    const ensureBillingAddressSaved = useCallback(async (): Promise<boolean> => {
        if (isLoading || isResettingAddress) {
            return false;
        }

        const errors = await validateForm();

        if (Object.keys(errors).length > 0) {
            await setTouched(setNestedObjectValues(errors, true));

            return false;
        }

        try {
            await onPersist(values);
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
        validateForm,
        setTouched,
        onPersist,
        values,
        onUnhandledError,
    ]);

    useEffect(() => {
        const register = paymentContext?.registerEnsureBillingAddressSaved;

        if (!register) {
            return;
        }

        register(ensureBillingAddressSaved);

        return () => {
            register(null);
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
        if (hasAddressExtraFields) {
            B2BSessionStorage.remove(B2BSessionStorage.billingExtraFieldsKey);
        }

        void handleSelectAddress({});
    };

    return (
        <div className="checkout-billing-form" data-test="checkout-billing-form">
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
        </div>
    );
};

export const PaymentBillingForm = withLanguage(
    withFormik<PaymentBillingFormProps & WithLanguageProps, BillingFormValues>({
        // No submit button — persistence happens via ensureBillingAddressSaved.
        handleSubmit: () => undefined,
        mapPropsToValues: ({ getFields, customerMessage, billingAddress }) =>
            getBillingFormInitialValues(getFields, billingAddress, customerMessage),
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
