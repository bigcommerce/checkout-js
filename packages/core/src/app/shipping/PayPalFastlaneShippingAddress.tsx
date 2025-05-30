import {
    Address,
    Consignment,
    Country,
    CustomerAddress,
    FormField
} from '@bigcommerce/checkout-sdk';
import React, { FC, useEffect, useRef, useState } from 'react';

import {
    isBigCommercePaymentsFastlaneMethod,
    isBraintreeFastlaneMethod,
    isPayPalCommerceFastlaneMethod,
    isPayPalFastlaneMethod,
    PayPalFastlaneShippingAddressForm,
    usePayPalFastlaneAddress,
} from '@bigcommerce/checkout/paypal-fastlane-integration';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { ShippingAddressProps } from './ShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';

export interface PayPalFastlaneShippingAddressProps extends ShippingAddressProps {
    methodId?: string,
    shippingAddress?:  Address,
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    formFields: FormField[],
    googleMapsApiKey?: string;
    handleFieldChange(fieldName: string, value: string): void,
    onAddressSelect(address: Address): void;
}

interface PayPalFastlaneAddressComponentRef {
    showAddressSelector?: () => Promise<CustomerAddress | undefined>;
}

export const PayPalFastlaneShippingAddress: FC<PayPalFastlaneShippingAddressProps> = (props) => {
    const {
        methodId,
        formFields,
        countries,
        onAddressSelect,
        onFieldChange,
        onUnhandledError,
        initialize,
        deinitialize,
        shippingAddress,
        addresses,
        handleFieldChange,
        isLoading
    } = props;
    const [isLoadingStrategy, setIsLoadingStrategyStrategy] = useState<boolean>(true);

    const paypalFastlaneShippingComponent = useRef<PayPalFastlaneAddressComponentRef>({});
    const fastlaneOptions = (provider: string) => {
        return {
            [provider]: {
                onPayPalFastlaneAddressChange: (
                    showPayPalFastlaneAddressSelector: PayPalFastlaneAddressComponentRef['showAddressSelector'],
                ) => {
                    paypalFastlaneShippingComponent.current.showAddressSelector =
                        showPayPalFastlaneAddressSelector;
                },
            },
        };
    }

    const initializeShippingStrategyOrThrow = async () => {
        try {
            await initialize({
                methodId,
                ...(isBigCommercePaymentsFastlaneMethod(methodId) ? fastlaneOptions('bigcommerce_payments_fastlane') : {}),
                ...(isBraintreeFastlaneMethod(methodId) ? fastlaneOptions('braintreefastlane') : {}),
                ...(isPayPalCommerceFastlaneMethod(methodId) ? fastlaneOptions('paypalcommercefastlane') : {})
            });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }

        setIsLoadingStrategyStrategy(false);
    };

    const deinitializeShippingStrategyOrThrow = async () => {
        try {
            await deinitialize({ methodId });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void initializeShippingStrategyOrThrow();

        return () => {
            void deinitializeShippingStrategyOrThrow();
        };
    }, []);

    const { shouldShowPayPalFastlaneShippingForm } = usePayPalFastlaneAddress();

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoadingStrategy || isLoading}>
            {methodId && isPayPalFastlaneMethod(methodId) && shippingAddress && shouldShowPayPalFastlaneShippingForm ? (
                <PayPalFastlaneShippingAddressForm
                    address={shippingAddress}
                    countries={countries}
                    deinitialize={deinitialize}
                    formFields={formFields}
                    initialize={initialize}
                    isLoading={isLoadingStrategy}
                    methodId={methodId}
                    onAddressSelect={onAddressSelect}
                    onFieldChange={onFieldChange}
                    onUnhandledError={onUnhandledError}
                    paypalFastlaneShippingComponentRef={paypalFastlaneShippingComponent}
                />
            ) : (
                <ShippingAddressForm
                    address={shippingAddress}
                    addresses={addresses}
                    consignments={props.consignments}
                    countries={countries}
                    countriesWithAutocomplete={props.countriesWithAutocomplete}
                    formFields={formFields}
                    googleMapsApiKey={props.googleMapsApiKey}
                    isFloatingLabelEnabled={props.isFloatingLabelEnabled}
                    isLoading={isLoadingStrategy}
                    onAddressSelect={onAddressSelect}
                    onFieldChange={handleFieldChange}
                    onUseNewAddress={props.onUseNewAddress}
                    shouldShowSaveAddress={props.shouldShowSaveAddress}
                />
            )}
        </LoadingOverlay>
    );
};