import type { CheckoutSelectors, FormField } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, Legend } from '@bigcommerce/checkout/ui';

import {
    AddressType,
    isEqualAddress,
    mapAddressFromFormValues,
    setDefaultAddress,
} from '../../address';
import { type BillingFormValues } from '../../billing/billingFormConfig';

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

const getFieldsWithExtraFields = (
    getBillingAddressFields: (countryCode: string) => FormField[],
    hasAddressExtraFields: boolean,
    getAddressExtraFields: () => FormField[],
    countryCode?: string,
) => {
    const addressFields = getBillingAddressFields(countryCode || '');

    if (!hasAddressExtraFields) {
        return addressFields;
    }

    const addressExtraFields = getAddressExtraFields();

    return [...addressFields, ...addressExtraFields];
};

export const PaymentBillingBlock: FunctionComponent<PaymentBillingBlockProps> = ({
    methodId,
    isBillingSameAsShipping,
    onBillingSameAsShippingChange,
    onUnhandledError,
}) => {
    const {
        selectedState: {
            checkout,
            config,
            customer,
            isLoadingBillingCountries,
            getBillingAddressFields,
            getAddressExtraFields,
        },
        // getBillingAddress / getShippingAddress guarantee the latest state inside
        // async callbacks
        checkoutState: {
            data: { getBillingAddress, getShippingAddress },
        },
        checkoutService,
    } = useCheckout(({ data, statuses }) => ({
        checkout: data.getCheckout(),
        config: data.getConfig(),
        customer: data.getCustomer(),
        isLoadingBillingCountries: statuses.isLoadingBillingCountries(),
        getBillingAddressFields: data.getBillingAddressFields,
        getAddressExtraFields: data.getAddressExtraFields,
    }));
    const {
        billing: { restrictManualAddressEntry },
        userJourney: { hasAddressExtraFields, hasCompanyAddressBook },
    } = useCapabilities();

    if (!config || !customer || !checkout) {
        throw new Error('Unable to access checkout data');
    }

    const [isApplyingDefaultAddress, setIsApplyingDefaultAddress] = useState(true);
    const isInitializing = isLoadingBillingCountries || isApplyingDefaultAddress;

    const hasAddresses = Boolean(customer.addresses && customer.addresses.length > 0);
    const showNoAddressesWarning = restrictManualAddressEntry && !hasAddresses;

    const customerMessage = checkout.customerMessage;
    const billingAddress = getBillingAddress();

    const handleBillingSameAsShippingChange = (checked: boolean) => {
        onBillingSameAsShippingChange(checked);

        if (!checked) {
            return;
        }

        const shippingAddress = getShippingAddress();

        if (shippingAddress && !isEqualAddress(shippingAddress, getBillingAddress())) {
            checkoutService.updateBillingAddress(shippingAddress).catch((error) => {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            });
        }
    };

    const getFields = useCallback(
        (countryCode?: string) =>
            getFieldsWithExtraFields(
                getBillingAddressFields,
                hasAddressExtraFields,
                getAddressExtraFields,
                countryCode,
            ),
        [getBillingAddressFields, hasAddressExtraFields, getAddressExtraFields],
    );

    // Persist without navigating — the payment step's "Place Order" is the only
    // submit. Called by PaymentBillingForm's pre-submit save; the isEqualAddress
    // guard prevents a redundant updateBillingAddress when nothing changed. Errors
    // propagate so the pre-submit save can block the order.
    const handlePersist = async ({
        orderComment,
        ...addressValues
    }: BillingFormValues): Promise<void> => {
        const currentBillingAddress = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, currentBillingAddress)) {
            promises.push(checkoutService.updateBillingAddress(address));
        }

        if (customerMessage !== orderComment) {
            promises.push(checkoutService.updateCheckout({ customerMessage: orderComment }));
        }

        await Promise.all(promises);
    };

    useEffect(() => {
        const init = async () => {
            try {
                await checkoutService.loadBillingAddressFields();

                if (hasCompanyAddressBook) {
                    await setDefaultAddress({
                        type: AddressType.Billing,
                        currentAddress: getBillingAddress(),
                        addresses: customer.addresses,
                        updateAddress: checkoutService.updateBillingAddress,
                    });
                }
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            } finally {
                setIsApplyingDefaultAddress(false);
            }
        };

        void init();
    }, []);

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
                    onBillingSameAsShippingChange={handleBillingSameAsShippingChange}
                    onPersist={handlePersist}
                    onUnhandledError={onUnhandledError}
                />
            </div>
        </AddressFormSkeleton>
    );
};
