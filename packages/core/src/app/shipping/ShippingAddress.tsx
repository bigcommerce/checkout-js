import {
    Address,
    CheckoutSelectors,
    Consignment,
    Country,
    CustomerAddress,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { noop } from 'lodash';
import React, { FunctionComponent, memo, useCallback, useContext } from 'react';

import { FormContext } from '../ui/form';

import RemoteShippingAddress from './RemoteShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';
import StaticAddressEditable from './StaticAddressEditable';

export interface ShippingAddressProps {
    addresses: CustomerAddress[];
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    formFields: FormField[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    hasRequestedShippingOptions: boolean;
    useFloatingLabel?: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onAddressSelect(address: Address): void;
    onFieldChange(name: string, value: string): void;
    onUnhandledError?(error: Error): void;
    onUseNewAddress(): void;
}

const ShippingAddress: FunctionComponent<ShippingAddressProps> = (props) => {
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
        isLoading,
        shippingAddress,
        hasRequestedShippingOptions,
        addresses,
        shouldShowSaveAddress,
        onUnhandledError = noop,
        isShippingStepPending,
        useFloatingLabel,
    } = props;

    const { setSubmitted } = useContext(FormContext);

    const initializeShipping = useCallback(
        memoizeOne(
            (defaultOptions: ShippingInitializeOptions) => (options?: ShippingInitializeOptions) =>
                initialize({
                    ...defaultOptions,
                    ...options,
                }),
        ),
        [],
    );

    const handleFieldChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        if (hasRequestedShippingOptions) {
            setSubmitted(true);
        }

        onFieldChange(fieldName, value);
    };

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

            return (
                <RemoteShippingAddress
                    containerId={containerId}
                    deinitialize={deinitialize}
                    formFields={formFields}
                    initialize={initializeShipping(options)}
                    methodId={methodId}
                    onFieldChange={onFieldChange}
                    useFloatingLabel={useFloatingLabel}
                />
            );
        }

        if (methodId === 'amazonpay' && shippingAddress) {
            const editAddressButtonId = 'edit-ship-button';

            options = {
                amazonpay: {
                    editAddressButtonId,
                },
            };

            return (
                <StaticAddressEditable
                    address={shippingAddress}
                    buttonId={editAddressButtonId}
                    deinitialize={deinitialize}
                    formFields={formFields}
                    initialize={initializeShipping(options)}
                    isLoading={isShippingStepPending}
                    methodId={methodId}
                    onFieldChange={onFieldChange}
                />
            );
        }
    }

    return (
        <ShippingAddressForm
            address={shippingAddress}
            addresses={addresses}
            consignments={consignments}
            countries={countries}
            countriesWithAutocomplete={countriesWithAutocomplete}
            formFields={formFields}
            googleMapsApiKey={googleMapsApiKey}
            isLoading={isLoading}
            onAddressSelect={onAddressSelect}
            onFieldChange={handleFieldChange}
            onUseNewAddress={onUseNewAddress}
            shouldShowSaveAddress={shouldShowSaveAddress}
            useFloatingLabel={useFloatingLabel}
        />
    );
};

export default memo(ShippingAddress);
