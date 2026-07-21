import type { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, Legend } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues, useAddressLabelDecoder } from '../address';

import BillingForm, { type BillingFormValues } from './BillingForm';
import { useBilling } from './hooks/useBilling';

export interface BillingProps {
    navigateNextStep(): void;
    onReady(): void;
    onUnhandledError(error: Error): void;
}

const Billing = ({ navigateNextStep, onReady, onUnhandledError }: BillingProps): ReactElement => {
    const {
        billingAddress,
        customerMessage,
        getBillingAddress,
        getFields,
        isInitializing,
        methodId,
        showNoAddressesWarning,
        updateBillingAddress,
        updateCheckout,
    } = useBilling({ onReady, onUnhandledError });
    const decode = useAddressLabelDecoder();

    const handleSubmit = async ({
        orderComment,
        ...addressValues
    }: BillingFormValues): Promise<void> => {
        const billingAddress = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, billingAddress)) {
            promises.push(updateBillingAddress(address));
        }

        if (customerMessage !== orderComment) {
            promises.push(updateCheckout({ customerMessage: orderComment }));
        }

        try {
            await Promise.all(promises);

            navigateNextStep();
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    if (showNoAddressesWarning) {
        return (
            <div className="no-addresses-warning body-regular">
                <TranslatedString id="billing.no_billing_addresses_warning" />
            </div>
        );
    }

    return (
        <AddressFormSkeleton isLoading={isInitializing}>
            <div className="checkout-form">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>
                <BillingForm
                    billingAddress={decode(billingAddress)}
                    customerMessage={customerMessage}
                    getFields={getFields}
                    methodId={methodId}
                    navigateNextStep={navigateNextStep}
                    onSubmit={handleSubmit}
                    onUnhandledError={onUnhandledError}
                    updateBillingAddress={updateBillingAddress}
                />
            </div>
        </AddressFormSkeleton>
    );
};

export default Billing;
