import React, { useEffect } from 'react';

import { useCheckout, useExtensions } from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';

import { CustomError } from '../common/error';
import { useShipping } from './hooks/useShipping';
import isUsingMultiShipping from './isUsingMultiShipping';
import MultiShippingForm, { type MultiShippingFormValues } from './MultiShippingForm';
import SingleShippingForm, { type SingleShippingFormValues } from './SingleShippingForm';
import { isExperimentEnabled } from '../common/utility';

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
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();
    const {
        cart,
        consignments,
        countries,
        customerMessage,
        deleteConsignments,
        deinitializeShippingMethod: deinitialize,
        getFields,
        isLoading,
        initializeShippingMethod: initialize,
        isShippingStepPending,
        methodId,
        shouldShowOrderComments,
        shippingAddress,
        validateMaxLength,
        signOut,
        updateShippingAddress: updateAddress
    } = useShipping();
    const { extensionState: { shippingFormRenderTimestamp } } = useExtensions();

    const config = getConfig();
    const isNoCountriesErrorOnCheckoutEnabled = isExperimentEnabled(config?.checkoutSettings, 'CHECKOUT-9630.no_countries_error_on_checkout', false);

    useEffect(() => {
        if (shippingFormRenderTimestamp) {
            const hasMultiShippingEnabled = config?.checkoutSettings?.hasMultiShippingEnabled ?? false;
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

    if (isInitialValueLoaded && countries.length === 0 && isNoCountriesErrorOnCheckoutEnabled) {
        return null;
    }

    return isMultiShippingMode ? (
        getMultiShippingForm()
    ) : (
        <SingleShippingForm
            cartHasChanged={cartHasChanged}
            consignments={consignments}
            customerMessage={customerMessage}
            deinitialize={deinitialize}
            deleteConsignments={deleteConsignments}
            getFields={getFields}
            initialize={initialize}
            isBillingSameAsShipping={isBillingSameAsShipping}
            isInitialValueLoaded={isInitialValueLoaded}
            isLoading={isLoading}
            isMultiShippingMode={isMultiShippingMode}
            isShippingStepPending={isShippingStepPending}
            methodId={methodId}
            onSubmit={onSingleShippingSubmit}
            onUnhandledError={onUnhandledError}
            shippingAddress={shippingAddress}
            shippingFormRenderTimestamp={shippingFormRenderTimestamp}
            shouldShowOrderComments={shouldShowOrderComments}
            signOut={signOut}
            updateAddress={updateAddress}
            validateMaxLength={validateMaxLength}
        />
    );
};

export default ShippingForm;
