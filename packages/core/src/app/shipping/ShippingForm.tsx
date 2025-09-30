import React, { useEffect } from 'react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

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
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();
    const {
        cart,
        consignments,
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
        signOut,
        updateShippingAddress: updateAddress
    } = useShipping();
    const { extensionState: { shippingFormRenderTimestamp } } = useExtensions();

    const config = getConfig();

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
        />
    );
};

export default ShippingForm;
