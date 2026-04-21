import type { CheckoutSelectors, FormField } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, useEffect } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import { B2BExtraFieldsSessionStorage, isEqualAddress, mapAddressFromFormValues } from '../address';
import { Legend } from '../ui/form';

import BillingForm, { type BillingFormValues } from './BillingForm';
import getBillingMethodId from './getBillingMethodId';

export interface BillingProps {
    navigateNextStep(): void;
    onReady(): void;
    onUnhandledError(error: Error): void;
}

const getFieldsWithExtraFields = (getBillingAddressFields: (countryCode: string) => FormField[], hasAddressExtraFields: boolean, getAddressExtraFields: () => FormField[], countryCode?: string) => {
    const addressFields = getBillingAddressFields(countryCode || '');

    if (!hasAddressExtraFields) {
        return addressFields;
    }

    const addressExtraFields = getAddressExtraFields();

    return [...addressFields, ...addressExtraFields];
};

const Billing = ({ navigateNextStep, onReady, onUnhandledError }:BillingProps): ReactElement => {
    const { checkoutService, checkoutState } = useCheckout();
    const { userJourney: { hasAddressExtraFields } } = useCapabilities();

    const {
        data: {
            getCheckout,
            getConfig,
            getCart,
            getCustomer,
            getBillingAddress,
            getBillingAddressFields,
            getAddressExtraFields,
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
    const handleSubmit = async ({
                                    orderComment,
                                    ...addressValues
                                }: BillingFormValues):Promise<void> => {
        const updateAddress  = checkoutService.updateBillingAddress;
        const updateCheckout  = checkoutService.updateCheckout;
        const billingAddress  = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues, B2BExtraFieldsSessionStorage.BILLING_KEY);

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

    // TODO: Show warning message when restrictManualAddressEntry is true and no addresses are available
    // Yet to decide where we get the addresses from in b2b flow??
    // const hasAddresses = customer?.addresses && customer.addresses.length > 0;
    // const showWarningMessage = restrictManualAddressEntry && !hasAddresses;

    // if (showWarningMessage) {
    //     return (
    //         <div className="no-addresses-warning body-regular">
    //             <TranslatedString id="billing.no_billing_addresses_warning" />
    //         </div>
    //     );
    // }

    return (
        <AddressFormSkeleton isLoading={isInitializing}>
            <div className="checkout-form">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>
                <BillingForm
                    billingAddress={billingAddress}
                    customerMessage={customerMessage}
                    getFields={(countryCode?: string) => getFieldsWithExtraFields(getBillingAddressFields, hasAddressExtraFields, getAddressExtraFields, countryCode)}
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
