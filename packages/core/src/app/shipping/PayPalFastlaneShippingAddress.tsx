import {
    type Address,
    type Consignment,
    type Country,
    type CustomerAddress,
    type FormField
} from '@bigcommerce/checkout-sdk';
import React, { type FC, useEffect, useRef, useState } from 'react';

import {
    isPayPalFastlaneMethod,
    PayPalFastlaneShippingAddressForm,
    usePayPalFastlaneAddress,
} from '@bigcommerce/checkout/paypal-fastlane-integration';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { type ShippingAddressProps } from './ShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';

export interface PayPalFastlaneShippingAddressProps extends ShippingAddressProps {
    methodId?: string,
    shippingAddress?:  Address,
    consignments: Consignment[];
    countries?: Country[];
    formFields: FormField[],
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
        handleFieldChange,
        isLoading
    } = props;
    const [isLoadingStrategy, setIsLoadingStrategyStrategy] = useState<boolean>(true);

    const paypalFastlaneShippingComponent = useRef<PayPalFastlaneAddressComponentRef>({});

    const initializeShippingStrategyOrThrow = async () => {
        try {
            await initialize({
                methodId,
                fastlane: {
                    onPayPalFastlaneAddressChange: (
                        showPayPalFastlaneAddressSelector: PayPalFastlaneAddressComponentRef['showAddressSelector'],
                    ) => {
                        paypalFastlaneShippingComponent.current.showAddressSelector =
                            showPayPalFastlaneAddressSelector;
                    },
                },
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
                    consignments={props.consignments}
                    formFields={formFields}
                    isLoading={isLoadingStrategy}
                    onAddressSelect={onAddressSelect}
                    onFieldChange={handleFieldChange}
                    onUseNewAddress={props.onUseNewAddress}
                    validateMaxLength={false}
                />
            )}
        </LoadingOverlay>
    );
};
