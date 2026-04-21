import React, { useEffect } from 'react';

import { useCapabilities, useExtensions } from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError } from '../common/error';

import { useShipping } from './hooks/useShipping';
import isUsingMultiShipping from './isUsingMultiShipping';
import MultiShippingForm, { type MultiShippingFormValues } from './MultiShippingForm';
import SingleShippingForm, { type SingleShippingFormValues } from './SingleShippingForm';
import SingleShippingFormClassComponent from './SingleShippingFormClass';

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
        defaultShippingExpectationMessage,
        deleteConsignments,
        deinitializeShippingMethod: deinitialize,
        getFields,
        hasMultiShippingEnabled,
        isLoading,
        initializeShippingMethod: initialize,
        isShippingStepPending,
        isNoCountriesErrorOnCheckoutEnabled,
        methodId,
        shouldShowOrderComments,
        shippingAddress,
        validateMaxLength,
        updateShippingAddress: updateAddress,
        useSingleShippingFormFunctionComponent,
    } = useShipping();
    const { shipping: { hideBillingSameAsShippingCheck } } = useCapabilities();
    const { extensionState: { shippingFormRenderTimestamp } } = useExtensions();

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
            onUnhandledError(new CustomError({
                name: 'no_countries_available',
                message: getLanguageService().translate('shipping.no_countries_available_message'),
                title: getLanguageService().translate('shipping.no_countries_available_heading'),
            }));
        }
    }, [isInitialValueLoaded, countries.length]);

    const getMultiShippingForm = () => {
        return <MultiShippingForm
            cartHasChanged={cartHasChanged}
            customerMessage={customerMessage}
            defaultCountryCode={shippingAddress?.countryCode}
            isLoading={isLoading}
            onSubmit={onMultiShippingSubmit}
            onUnhandledError={onUnhandledError}
        />;
    };

    const getSingleShippingForm = () => {
        const singleShippingFormProps = {
            cartHasChanged,
            consignments,
            customerMessage,
            defaultShippingExpectationMessage,
            deinitialize,
            deleteConsignments,
            getFields,
            initialize,
            isBillingSameAsShipping,
            isInitialValueLoaded,
            isLoading,
            isShippingStepPending,
            methodId,
            onSubmit: onSingleShippingSubmit,
            onUnhandledError,
            shippingAddress,
            shippingFormRenderTimestamp,
            shouldShowOrderComments,
            updateAddress,
            validateMaxLength,
        };

        if (useSingleShippingFormFunctionComponent) {
            return <SingleShippingForm {...singleShippingFormProps} />;
        }

        return <SingleShippingFormClassComponent
            {...singleShippingFormProps}
            hideBillingSameAsShippingCheck={hideBillingSameAsShippingCheck}
            isMultiShippingMode={isMultiShippingMode}
        />;
    }

    if (isInitialValueLoaded && countries.length === 0 && isNoCountriesErrorOnCheckoutEnabled) {
        return null;
    }

    return isMultiShippingMode ? (
        getMultiShippingForm()
    ) : (
        getSingleShippingForm()
    );
};

export default ShippingForm;
