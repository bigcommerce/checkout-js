import { Address, CheckoutRequestBody, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, Legend } from '@bigcommerce/checkout/ui';

import PayPalAxoBillingForm, { BillingFormValues } from './PayPalAxoBillingForm';

interface PayPalAxoBillingProps {
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isInitializing: boolean;
    isUpdating: boolean;
    shouldShowOrderComments: boolean;
    billingAddress?: Address;
    methodId?: string;
    isFloatingLabelEnabled?: boolean;
    getFields(countryCode?: string): FormField[];
    initialize(): Promise<CheckoutSelectors>;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
    navigateNextStep(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSubmit(values: BillingFormValues): void;
}

const PayPalAxoBilling = ({
    isInitializing,
    ...props
}: PayPalAxoBillingProps) => {
    return (
        <AddressFormSkeleton isLoading={isInitializing}>
            <div className="checkout-form">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>
                <PayPalAxoBillingForm {...props} />
            </div>
        </AddressFormSkeleton>
    );
};

export default PayPalAxoBilling;
