import type { Address } from '@bigcommerce/checkout-sdk';
import { omit } from 'lodash';
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
            // The consignment address carries email: '' — sent as-is it overwrites
            // the guest email; omitted, the SDK falls back to the stored one.
            updateBillingAddress(omit(shippingAddress, 'email')).catch((error) => {
                onBillingSameAsShippingChange(false);

                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            });
        }
    };

    const saveOrderComment = async (orderComment: string): Promise<void> => {
        if (customerMessage === orderComment) {
            return;
        }

        await updateCheckout({ customerMessage: orderComment });
    };

    const handleSelectAddress = async (address: Partial<Address>, orderComment: string) => {
        await saveOrderComment(orderComment);

        return updateBillingAddress(address);
    };

    const lastRequestedCountryCodeRef = useRef<string | undefined>();

    const handleBillingCountryChange = (
        countryCode: string,
        addressValues: AddressFormValues,
        orderComment: string,
    ) => {
        const lastCountryCode =
            lastRequestedCountryCodeRef.current ?? getBillingAddress()?.countryCode;

        if (lastCountryCode === countryCode) {
            return;
        }

        lastRequestedCountryCodeRef.current = countryCode;

        saveOrderComment(orderComment)
            .then(() =>
                updateBillingAddress({
                    ...mapAddressFromFormValues(addressValues),
                    countryCode,
                    stateOrProvince: '',
                    stateOrProvinceCode: '',
                }),
            )
            .catch((error) => {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            })
            .finally(() => {
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
        const promises: Array<Promise<unknown>> = [saveOrderComment(orderComment)];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, currentBillingAddress)) {
            promises.push(updateBillingAddress(address));
        }

        await Promise.all(promises);
    };

    if (showNoAddressesWarning) {
        return (
            <div className="no-addresses-warning optimizedCheckout-contentPrimary body-regular">
                <TranslatedString id="billing.no_billing_addresses_warning" />
            </div>
        );
    }

    return (
        <AddressFormSkeleton isLoading={isInitializing} renderWhileLoading>
            <div className="checkout-billing" data-test="payment-billing-block">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading_v2" />
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
                    onSelectAddress={handleSelectAddress}
                    onUnhandledError={onUnhandledError}
                />
            </div>
        </AddressFormSkeleton>
    );
};
