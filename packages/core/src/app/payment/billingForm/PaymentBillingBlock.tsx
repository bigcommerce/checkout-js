import type { CheckoutSelectors, FormField } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, Legend } from '@bigcommerce/checkout/ui';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import {
    AddressType,
    isEqualAddress,
    mapAddressFromFormValues,
    setDefaultAddress,
} from '../../address';
import { type BillingFormValues } from '../../billing/billingFormConfig';
import getBillingMethodId from '../../billing/getBillingMethodId';

import PaymentBillingForm from './PaymentBillingForm';

export interface PaymentBillingBlockProps {
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

/**
 * Billing address container rendered inside the payment step under themeV2
 * (CHECKOUT-10150). Loads billing fields / default address and hosts
 * `PaymentBillingForm`, which persists via a pre-submit flush. The standalone
 * Billing step remains for the legacy (v1) path.
 */
export const PaymentBillingBlock: FunctionComponent<PaymentBillingBlockProps> = ({
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
        // getBillingAddress guarantees the latest state inside async callbacks
        checkoutState: {
            data: { getBillingAddress },
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
        userJourney: { hasAddressExtraFields, hasCompanyAddressBook },
    } = useCapabilities();

    if (!config || !customer || !checkout) {
        throw new Error('Unable to access checkout data');
    }

    const [isApplyingDefaultAddress, setIsApplyingDefaultAddress] = useState(true);
    const isInitializing = isLoadingBillingCountries || isApplyingDefaultAddress;

    const customerMessage = checkout.customerMessage;
    const methodId = getBillingMethodId(checkout);
    const billingAddress = getBillingAddress();

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
    // submit. Called by PaymentBillingForm's pre-submit flush; the isEqualAddress
    // guard prevents a redundant updateBillingAddress when nothing changed. Errors
    // propagate so the flush can block the order.
    const handlePersist = async ({
        orderComment,
        ...addressValues
    }: BillingFormValues): Promise<void> => {
        const currentBillingAddress = getBillingAddress();
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(
            addressValues,
            B2BSessionStorage.billingExtraFieldsKey,
        );

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

    return (
        <AddressFormSkeleton isLoading={isInitializing}>
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
                    methodId={methodId}
                    onPersist={handlePersist}
                    onUnhandledError={onUnhandledError}
                />
            </div>
        </AddressFormSkeleton>
    );
};
