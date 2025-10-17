import type { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, useEffect } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    useCheckout,
} from '@bigcommerce/checkout/payment-integration-api';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { Legend } from '../ui/form';

import BillingForm, { type BillingFormValues } from './BillingForm';
import getBillingMethodId from './getBillingMethodId';

interface BillingProps {
    navigateNextStep(): void;
    onReady(): void;
    onUnhandledError(error: Error): void;
}

const Billing = ({ navigateNextStep, onReady, onUnhandledError }:BillingProps): ReactElement => {
    const { checkoutService, checkoutState } = useCheckout();
    const { themeV2 }  = useThemeContext();

    const {
        data: {
            getCheckout,
            getConfig,
            getCart,
            getCustomer,
            getBillingAddress,
            getBillingAddressFields,
        },
        statuses: { isLoadingBillingCountries },
    } = checkoutState;
    const config = getConfig();
    const customer = getCustomer();
    const checkout = getCheckout();
    const cart = getCart();

    if (!config || !customer || !checkout || !cart) {
        throw new Error('Unable to access checkout data')
    }

    const isInitializing  = isLoadingBillingCountries();

    // Below constants are for <BillingForm />'s HOC props
    const customerMessage  = checkout.customerMessage;
    const methodId  = getBillingMethodId(checkout);
    const billingAddress  = getBillingAddress();
    const getFields  = getBillingAddressFields;
    const handleSubmit = async ({
                                    orderComment,
                                    ...addressValues
                                }: BillingFormValues):Promise<void> => {
        const updateAddress  = checkoutService.updateBillingAddress;
        const updateCheckout  = checkoutService.updateCheckout;
        const billingAddress  = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, billingAddress)) {
            promises.push(updateAddress(address));
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

    useEffect(() => {
        const init = async () => {
            try {
                await checkoutService.loadBillingAddressFields();
                onReady();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        }

        void init();
    }, []);

    return (
        <AddressFormSkeleton isLoading={isInitializing}>
            <div className="checkout-form">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading" themeV2={themeV2}>
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>
                <BillingForm
                    billingAddress={billingAddress}
                    customerMessage={customerMessage}
                    getFields={getFields}
                    methodId={methodId}
                    navigateNextStep={navigateNextStep}
                    onSubmit={handleSubmit}
                    onUnhandledError={onUnhandledError}
                />
            </div>
        </AddressFormSkeleton>
    );
}

export default Billing;
