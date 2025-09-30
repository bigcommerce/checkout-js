import React, { type ReactNode, useState } from 'react';

import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import type CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import { useShipping } from '../hooks/useShipping';
import ShippingHeader from '../ShippingHeader';

import StripeShippingForm, { type SingleShippingFormValues } from './StripeShippingForm';

export interface StripeShippingProps {
  isBillingSameAsShipping: boolean;
  cartHasChanged: boolean;
  isMultiShippingMode: boolean;
  step: CheckoutStepStatus;
  isInitializing: boolean;
  isInitialValueLoaded: boolean;
  isLoading: boolean;
  onReady?(): void;
  onUnhandledError(error: Error): void;
  onSubmit(values: SingleShippingFormValues): void;
  onMultiShippingChange(): void;
}

const StripeShipping = ({
  cartHasChanged,
  isBillingSameAsShipping,
  isInitialValueLoaded,
  isMultiShippingMode,
  step,
  onSubmit,
  onMultiShippingChange,
  onUnhandledError,
  isLoading,
}: StripeShippingProps): ReactNode => {
  const { 
    customerMessage,
    getFields,
    isLoading: isShippingMethodLoading,
    methodId,
    updateShippingAddress: updateAddress,
    shippingAddress,
    shouldShowMultiShipping,
    shouldShowOrderComments,
  } = useShipping();

  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [isStripeAutoStep, setIsStripeAutoStep] = useState(false);

  const stripeLoadedCallback = () => {
    setIsStripeLoading(false);
  };

  const handleIsAutoStep = () => {
    setIsStripeAutoStep(true);
  };

  return (
    <>
      <AddressFormSkeleton isLoading={isStripeAutoStep || isStripeLoading} />
      <div
        className="checkout-form"
        style={{ display: isStripeAutoStep || isStripeLoading ? 'none' : undefined }}
      >
        <ShippingHeader
          isMultiShippingMode={isMultiShippingMode}
          onMultiShippingChange={onMultiShippingChange}
          shouldShowMultiShipping={shouldShowMultiShipping}
        />
        <StripeShippingForm
          cartHasChanged={cartHasChanged}
          customerMessage={customerMessage}
          getFields={getFields}
          isBillingSameAsShipping={isBillingSameAsShipping}
          isInitialValueLoaded={isInitialValueLoaded}
          isLoading={isLoading}
          isMultiShippingMode={isMultiShippingMode}
          isShippingMethodLoading={isShippingMethodLoading}
          isStripeAutoStep={handleIsAutoStep}
          isStripeLoading={stripeLoadedCallback}
          methodId={methodId}
          onSubmit={onSubmit}
          onUnhandledError={onUnhandledError}
          shippingAddress={shippingAddress}
          shouldShowOrderComments={shouldShowOrderComments}
          step={step}
          updateAddress={updateAddress}
        />
      </div>
    </>
  );
};

export default StripeShipping;
