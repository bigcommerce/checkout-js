import { type FormField } from '@bigcommerce/checkout-sdk';
import { useCallback, useEffect, useState } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';

import { AddressType, setDefaultAddress } from '../../address';
import getBillingMethodId from '../getBillingMethodId';

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

export interface UseBillingOptions {
    onReady?(): void;
    onUnhandledError(error: Error): void;
}

export const useBilling = ({ onReady, onUnhandledError }: UseBillingOptions) => {
    const {
        selectedState: {
            checkout,
            config,
            customer,
            isLoadingBillingCountries,
            getBillingAddressFields,
            getAddressExtraFields,
        },
        // using getBillingAddress function to guarantee latest state inside of async functions
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
        userJourney: { hasAddressExtraFields, hasCompanyAddressBook },
        billing: { restrictManualAddressEntry },
    } = useCapabilities();

    if (!config || !customer || !checkout) {
        throw new Error('Unable to access checkout data');
    }

    const [isApplyingDefaultAddress, setIsApplyingDefaultAddress] = useState(true);
    const isInitializing = isLoadingBillingCountries || isApplyingDefaultAddress;

    const customerMessage = checkout.customerMessage;
    const billingAddress = getBillingAddress();
    const methodId = getBillingMethodId(checkout);

    const hasAddresses = Boolean(customer.addresses && customer.addresses.length > 0);
    const showNoAddressesWarning = restrictManualAddressEntry && !hasAddresses;

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

                onReady?.();
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

    return {
        billingAddress,
        customerMessage,
        getBillingAddress,
        getFields,
        getShippingAddress,
        isInitializing,
        methodId,
        showNoAddressesWarning,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
    };
};
