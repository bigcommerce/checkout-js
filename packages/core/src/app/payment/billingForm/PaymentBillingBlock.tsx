import type { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, Legend } from '@bigcommerce/checkout/ui';

import { type AddressFormValues, isEqualAddress, mapAddressFromFormValues } from '../../address';
import { type BillingFormValues } from '../../billing/billingFormConfig';
import { useBilling } from '../../billing/hooks/useBilling';

import { PaymentBillingForm } from './PaymentBillingForm';

export interface PaymentBillingBlockProps {
    // Id of the payment method currently selected on the payment step. Drives the
    // billing form's method-specific behaviour (e.g. Amazon Pay's static address
    // + reduced schema). Must reflect the live selection, not checkout.payments.
    methodId?: string;
    isBillingSameAsShipping: boolean;
    onBillingSameAsShippingChange(isBillingSameAsShipping: boolean): void;
    onUnhandledError(error: Error): void;
}

export const PaymentBillingBlock: FunctionComponent<PaymentBillingBlockProps> = ({
    methodId,
    isBillingSameAsShipping,
    onBillingSameAsShippingChange,
    onUnhandledError,
}) => {
    const {
        billingAddress,
        customerMessage,
        getBillingAddress,
        getFields,
        getShippingAddress,
        isInitializing,
        showNoAddressesWarning,
        updateBillingAddress,
        updateCheckout,
    } = useBilling({ onUnhandledError });

    const handleBillingSameAsShippingChange = (checked: boolean) => {
        onBillingSameAsShippingChange(checked);

        if (!checked) {
            return;
        }

        const shippingAddress = getShippingAddress();

        if (shippingAddress && !isEqualAddress(shippingAddress, getBillingAddress())) {
            updateBillingAddress(shippingAddress).catch((error) => {
                onBillingSameAsShippingChange(false);

                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            });
        }
    };

    // The store's countryCode is stale while an update is in flight; guarding
    // on it would drop a quick flip back to the original country. Only
    // meaningful while a request is pending — it is cleared once it settles,
    // so billing changes made via other paths aren't wrongly vetoed.
    const lastRequestedCountryCodeRef = useRef<string | undefined>();

    // Persisting the form values (not the store address) keeps typed fields
    // alive through the Formik reinitialize that follows; stateOrProvince is
    // country-specific so it must be cleared.
    const handleBillingCountryChange = (countryCode: string, addressValues: AddressFormValues) => {
        const lastCountryCode =
            lastRequestedCountryCodeRef.current ?? getBillingAddress()?.countryCode;

        if (lastCountryCode === countryCode) {
            return;
        }

        lastRequestedCountryCodeRef.current = countryCode;

        updateBillingAddress({
            ...mapAddressFromFormValues(addressValues),
            // Must win — addressValues may still carry the old country.
            countryCode,
            stateOrProvince: '',
            stateOrProvinceCode: '',
        })
            .catch((error) => {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            })
            .finally(() => {
                // Unless a newer request has taken over the ref.
                if (lastRequestedCountryCodeRef.current === countryCode) {
                    lastRequestedCountryCodeRef.current = undefined;
                }
            });
    };

    // Persist without navigating — the payment step's "Place Order" is the only
    // submit. Called by PaymentBillingForm's pre-submit save;
    const handlePersist = async ({
        orderComment,
        ...addressValues
    }: BillingFormValues): Promise<void> => {
        const currentBillingAddress = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, currentBillingAddress)) {
            promises.push(updateBillingAddress(address));
        }

        if (customerMessage !== orderComment) {
            promises.push(updateCheckout({ customerMessage: orderComment }));
        }

        await Promise.all(promises);
    };

    if (showNoAddressesWarning) {
        return (
            <div className="no-addresses-warning body-regular">
                <TranslatedString id="billing.no_billing_addresses_warning" />
            </div>
        );
    }

    return (
        <AddressFormSkeleton isLoading={isInitializing} renderWhileLoading>
            <div className="checkout-billing" data-test="payment-billing-block">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>
                <PaymentBillingForm
                    billingAddress={billingAddress}
                    customerMessage={customerMessage}
                    getFields={getFields}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isLoading={isInitializing}
                    methodId={methodId}
                    onBillingCountryChange={handleBillingCountryChange}
                    onBillingSameAsShippingChange={handleBillingSameAsShippingChange}
                    onPersist={handlePersist}
                    onUnhandledError={onUnhandledError}
                    updateBillingAddress={updateBillingAddress}
                />
            </div>
        </AddressFormSkeleton>
    );
};
