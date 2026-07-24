import { type Address, type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import { type FormikProps, setNestedObjectValues, withFormik } from 'formik';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { AddressFormSkeleton, Fieldset, LoadingOverlay } from '@bigcommerce/checkout/ui';

import {
    AddressForm,
    AddressSelect,
    AddressType,
    decodeAddressLabel,
    isValidCustomerAddress,
} from '../../address';
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

type PaymentBillingFormValues = BillingFormValues & { billingSameAsShipping: boolean };

export interface PaymentBillingFormProps {
    methodId?: string;
    billingAddress?: Address;
    customerMessage: string;
    isLoading: boolean;
    isBillingSameAsShipping: boolean;
    getFields(countryCode?: string): FormField[];
    // Persists the billing address (updateBillingAddress). Must throw on failure
    // so the pre-submit ensureBillingAddressSaved can block the order.
    onPersist(values: BillingFormValues): Promise<void>;
    onBillingSameAsShippingChange(isBillingSameAsShipping: boolean): void;
    onUnhandledError(error: Error): void;
    updateBillingAddress(address: Partial<Address>): Promise<unknown>;
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
    updateBillingAddress,
}: PaymentBillingFormProps & WithLanguageProps & FormikProps<PaymentBillingFormValues>) => {
    const [isResettingAddress, setIsResettingAddress] = useState(false);
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();
    const paymentContext = useContext(PaymentContext);

    const {
        selectedState: { customer, config, cart, isUpdatingBillingAddress },
    } = useCheckout(({ data, statuses }) => ({
        customer: data.getCustomer(),
        config: data.getConfig(),
        cart: data.getCart(),
        isUpdatingBillingAddress: statuses.isUpdatingBillingAddress(),
    }));
    const {
        billing: { hideSaveToAddressBookCheck, restrictManualAddressEntry },
        shipping: { hideBillingSameAsShippingCheck },
        userJourney: { hasAddressLabel },
    } = useCapabilities();

    if (!config || !customer || !cart) {
        throw new Error('checkout data is not available');
    }

    const isGuest = customer.isGuest;
    const shouldRenderStaticAddress = methodId === 'amazonpay';
    const allFormFields = getFields(values.countryCode);
    const customOrExtraFields = allFormFields.filter(
        (field) => field.custom || isExtraField(field),
    );
    const hasCustomOrExtraFields = customOrExtraFields.length > 0;
    const editableFormFields =
        shouldRenderStaticAddress && hasCustomOrExtraFields ? customOrExtraFields : allFormFields;
    const rawBillingAddresses =
        isGuest && isPayPalFastlaneEnabled ? paypalFastlaneAddresses : customer.addresses;

    const billingAddresses = rawBillingAddresses.map((address) =>
        decodeAddressLabel(address, hasAddressLabel),
    );

    const hasAddresses = rawBillingAddresses.length > 0;
    const hasValidCustomerAddress =
        billingAddress &&
        isValidCustomerAddress(
            billingAddress,
            billingAddresses,
            getFields(billingAddress.countryCode),
        );
    const { enableOrderComments } = config.checkoutSettings;
    const hasShippableItems = getShippableItemsCount(cart) > 0;
    const shouldShowOrderComments = enableOrderComments && !hasShippableItems;
    const shouldShowSaveAddress = !hideSaveToAddressBookCheck && !isGuest;
    // With no shippable items there is no shipping address to mirror, so the
    // toggle is hidden and the billing form renders expanded.
    const shouldShowBillingSameAsShipping =
        !shouldRenderStaticAddress && !hideBillingSameAsShippingCheck && hasShippableItems;
    const isBillingAddressCollapsed =
        shouldShowBillingSameAsShipping && values.billingSameAsShipping;

    const ensureBillingAddressSaved = useCallback(async (): Promise<boolean> => {
        if (isLoading || isResettingAddress) {
            return false;
        }

        // A checked, visible toggle is trusted as proof billing already mirrors shipping.
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
            await updateBillingAddress(address);
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
                    disabled={isUpdatingBillingAddress}
                    labelStringId="billing.same_as_shipping_label"
                    onChange={onBillingSameAsShippingChange}
                />
            )}

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
