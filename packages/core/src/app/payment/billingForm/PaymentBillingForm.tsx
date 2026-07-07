import {
    type Address,
    type CustomerAddress,
    type FormField,
    isExtraField,
} from '@bigcommerce/checkout-sdk/essential';
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
    getFields(countryCode?: string): FormField[];
    // Persists the billing address (updateBillingAddress). Must throw on failure
    // so the pre-submit flush can block the order.
    onPersist(values: BillingFormValues): Promise<void>;
    onUnhandledError(error: Error): void;
}

/**
 * Billing address form for the payment step under themeV2. Unlike the legacy
 * standalone BillingForm it renders no <form> wrapper and no submit button, and
 * it persists via a flush the payment submit awaits (registered on PaymentContext)
 * rather than on its own submit — so the order can't finalize against a stale
 * billing address.
 */
const PaymentBillingForm = ({
    methodId,
    getFields,
    billingAddress,
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

    // Flush a pending edit before the payment step places the order: validate,
    // surface errors + block on invalid, otherwise persist and allow the order.
    const flush = useCallback(async (): Promise<boolean> => {
        const errors = await validateForm();

        if (Object.keys(errors).length > 0) {
            await setTouched(setNestedObjectValues(errors, true));

            return false;
        }

        await onPersist(values);

        return true;
    }, [validateForm, setTouched, onPersist, values]);

    useEffect(() => {
        const registerBillingAddressFlush = paymentContext?.registerBillingAddressFlush;

        if (!registerBillingAddressFlush) {
            return;
        }

        registerBillingAddressFlush(flush);

        return () => {
            registerBillingAddressFlush(null);
        };
    }, [paymentContext, flush]);

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

export default withLanguage(
    withFormik<PaymentBillingFormProps & WithLanguageProps, BillingFormValues>({
        // No submit button — persistence happens via the flush, not on submit.
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
    })(PaymentBillingForm),
);
