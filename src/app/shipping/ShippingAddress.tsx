import { Address, CheckoutSelectors, Consignment, Country, CustomerAddress, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { noop } from 'lodash';
import React, { memo, useCallback, FunctionComponent } from 'react';

import RemoteShippingAddress from './RemoteShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';

export interface ShippingAddressProps {
    addresses: CustomerAddress[];
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    formFields: FormField[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    methodId?: string;
    shippingAddress?: Address;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(name: string, value: string): void;
    onUnhandledError?(error: Error): void;
    onUseNewAddress(): void;
    signOut(options?: CustomerRequestOptions): void;
}

const ShippingAddress: FunctionComponent<ShippingAddressProps> = props => {
    const {
        methodId,
        formFields,
        countries,
        countriesWithAutocomplete,
        consignments,
        googleMapsApiKey,
        onAddressSelect,
        onFieldChange,
        onUseNewAddress,
        initialize,
        deinitialize,
        signOut,
        isLoading,
        shippingAddress,
        addresses,
        onUnhandledError = noop,
    } = props;

    const handleSignOutRequest = useCallback(async () => {
        try {
            await signOut({ methodId });
            window.location.reload();
        } catch (error) {
            onUnhandledError(error);
        }
    }, [
        methodId,
        onUnhandledError,
        signOut,
    ]);

    const initializeShipping = useCallback(memoizeOne((defaultOptions: ShippingInitializeOptions) => (
        (options?: ShippingInitializeOptions) => initialize({
            ...defaultOptions,
            ...options,
        })
    )), []);

    if (methodId) {
        const containerId = 'addressWidget';
        let options: ShippingInitializeOptions = {};

        if (methodId === 'amazon') {
            options = {
                amazon: {
                    container: containerId,
                    onError: onUnhandledError,
                },
            };
        }

        return (
            <RemoteShippingAddress
                containerId={ containerId }
                methodId={ methodId }
                onSignOut={ handleSignOutRequest }
                deinitialize={ deinitialize }
                initialize={ initializeShipping(options) }
            />
        );
    }

    return (
        <ShippingAddressForm
            isLoading={ isLoading }
            countries={ countries }
            countriesWithAutocomplete={ countriesWithAutocomplete }
            consignments={ consignments }
            googleMapsApiKey={ googleMapsApiKey }
            formFields={ formFields }
            address={ shippingAddress }
            addresses={ addresses }
            onFieldChange={ onFieldChange }
            onAddressSelect={ onAddressSelect }
            onUseNewAddress={ onUseNewAddress }
        />
    );
};

export default memo(ShippingAddress);
