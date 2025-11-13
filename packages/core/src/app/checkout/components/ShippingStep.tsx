import type { Cart, Consignment } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import { type ShippingProps, ShippingSummary } from '../../shipping';
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
    if (!cart) {
        return null;
    }

    return (
        <CheckoutStep
            {...step}
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

