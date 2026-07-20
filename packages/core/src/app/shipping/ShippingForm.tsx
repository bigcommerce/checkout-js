import { type Cart } from '@bigcommerce/checkout-sdk';
import React, { useEffect } from 'react';

import { useCapabilities, useExtensions } from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError } from '../common/error';

import { useShipping } from './hooks/useShipping';
import isUsingMultiShipping from './isUsingMultiShipping';
import MultiShippingForm, { type MultiShippingFormValues } from './MultiShippingForm';
import SingleShippingForm, { type SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingFormProps {
    cartHasChanged: boolean;
    isBillingSameAsShipping: boolean;
    isMultiShippingMode: boolean;
    isInitialValueLoaded: boolean;
    onCreateAccount(): void;
    onMultiShippingSubmit(values: MultiShippingFormValues): void;
    onSignIn(): void;
    onSingleShippingSubmit(values: SingleShippingFormValues): void;
    onUnhandledError(error: Error): void;
    setIsMultishippingMode(isMultiShippingMode: boolean): void;
}

const ShippingForm = ({
    cartHasChanged,
    isBillingSameAsShipping,
    isMultiShippingMode,
    onMultiShippingSubmit,
    onSingleShippingSubmit,
    onUnhandledError,
    isInitialValueLoaded,
    setIsMultishippingMode,
}: ShippingFormProps) => {
    const {
        cart,
        consignments,
        countries,
        customerMessage,
        getFields,
        hasMultiShippingEnabled,
        isNoCountriesErrorOnCheckoutEnabled,
        methodId,
        shippingAddress,
    } = useShipping();
    const {
        extensionState: { shippingFormRenderTimestamp },
    } = useExtensions();
    const {
        userJourney: { hasAddressLabel },
    } = useCapabilities();
    // cart.companyName exists in the API response but is not yet in the SDK types.
    const cartCompanyName = (cart as Cart & { companyName?: string })?.companyName ?? '';

    useEffect(() => {
        if (shippingFormRenderTimestamp) {
            const isMultiShippingMode =
                !!cart &&
                !!consignments &&
                hasMultiShippingEnabled &&
                isUsingMultiShipping(consignments, cart.lineItems);

            setIsMultishippingMode(isMultiShippingMode);
        }
    }, [shippingFormRenderTimestamp]);

    useEffect(() => {
        if (isInitialValueLoaded && countries.length === 0 && isNoCountriesErrorOnCheckoutEnabled) {
            onUnhandledError(
                new CustomError({
                    name: 'no_countries_available',
                    message: getLanguageService().translate(
                        'shipping.no_countries_available_message',
                    ),
                    title: getLanguageService().translate(
                        'shipping.no_countries_available_heading',
                    ),
                }),
            );
        }
    }, [isInitialValueLoaded, countries.length]);

    const getMultiShippingForm = () => {
        return (
            <MultiShippingForm
                cartHasChanged={cartHasChanged}
                customerMessage={customerMessage}
                defaultCountryCode={shippingAddress?.countryCode}
                onSubmit={onMultiShippingSubmit}
                onUnhandledError={onUnhandledError}
            />
        );
    };

    if (isInitialValueLoaded && countries.length === 0 && isNoCountriesErrorOnCheckoutEnabled) {
        return null;
    }

    return isMultiShippingMode ? (
        getMultiShippingForm()
    ) : (
        <SingleShippingForm
            cartCompanyName={cartCompanyName}
            cartHasChanged={cartHasChanged}
            customerMessage={customerMessage}
            getFields={getFields}
            hasAddressLabel={hasAddressLabel}
            isBillingSameAsShipping={isBillingSameAsShipping}
            isInitialValueLoaded={isInitialValueLoaded}
            methodId={methodId}
            onSubmit={onSingleShippingSubmit}
            onUnhandledError={onUnhandledError}
            shippingAddress={shippingAddress}
            shippingFormRenderTimestamp={shippingFormRenderTimestamp}
        />
    );
};

export default ShippingForm;
