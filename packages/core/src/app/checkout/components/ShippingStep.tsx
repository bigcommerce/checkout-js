import type { Cart, Consignment } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy } from 'react';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import { type ShippingProps, ShippingSummary } from '../../shipping';
import shouldShowMultiShippingToggle from '../../shipping/shouldShowMultiShippingToggle';
import CheckoutStep from '../CheckoutStep';
import type CheckoutStepType from '../CheckoutStepType';

const Shipping = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "shipping" */
                '../../shipping/Shipping'
            ),
    ),
);

export interface ShippingStepProps extends ShippingProps {
    cart?: Cart;
    consignments: Consignment[];
    isShippingDiscountDisplayEnabled: boolean;
    onEdit(type: CheckoutStepType): void;
    onExpanded(type: CheckoutStepType): void;
}

const ShippingStep: React.FC<ShippingStepProps> = ({
    step,
    cartHasChanged,
    cart,
    consignments,
    isBillingSameAsShipping,
    isMultiShippingMode,
    isShippingDiscountDisplayEnabled,
    onEdit,
    onExpanded,
    navigateNextStep,
    onCreateAccount,
    onReady,
    onSignIn,
    onToggleMultiShipping,
    onUnhandledError,
    setIsMultishippingMode,
}) => {
    const { themeV2 } = useThemeContext();
    const { selectedState } = useCheckout(({ data: { getCheckout, getConfig } }) => ({
        checkout: getCheckout(),
        config: getConfig(),
    }));
    const { checkout, config } = selectedState;

    if (!cart) {
        return null;
    }

    // Renders eagerly, before the lazy-loaded Shipping step body (and its
    // interactive, modal-aware version of this toggle) has mounted, so the
    // header doesn't briefly appear without a CTA. CheckoutStep prefers the
    // richer version reported via context as soon as it's available.
    const headerAction =
        themeV2 && checkout && config && shouldShowMultiShippingToggle(checkout, config, cart) ? (
            <span className="body-cta" data-test="shipping-mode-toggle">
                <TranslatedString
                    id={isMultiShippingMode ? 'shipping.ship_to_single' : 'shipping.ship_to_multi'}
                />
            </span>
        ) : null;

    return (
        <CheckoutStep
            {...step}
            headerAction={headerAction}
            heading={<TranslatedString id="shipping.shipping_heading" />}
            key={step.type}
            onEdit={onEdit}
            onExpanded={onExpanded}
            summary={
                <ShippingSummary
                    cart={cart}
                    consignments={consignments}
                    isMultiShippingMode={isMultiShippingMode}
                    isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
                />
            }
        >
            <LazyContainer loadingSkeleton={<AddressFormSkeleton />}>
                <Shipping
                    cartHasChanged={cartHasChanged}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isMultiShippingMode={isMultiShippingMode}
                    navigateNextStep={navigateNextStep}
                    onCreateAccount={onCreateAccount}
                    onReady={onReady}
                    onSignIn={onSignIn}
                    onToggleMultiShipping={onToggleMultiShipping}
                    onUnhandledError={onUnhandledError}
                    setIsMultishippingMode={setIsMultishippingMode}
                    step={step}
                />
            </LazyContainer>
        </CheckoutStep>
    );
};

export default ShippingStep;
