import {
  type Address,
  type CheckoutSelectors,
} from '@bigcommerce/checkout-sdk';
import React, { type ReactNode, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { AddressFormSkeleton } from '@bigcommerce/checkout/ui';

import type CheckoutStepStatus from '../../checkout/CheckoutStepStatus';
import { EMPTY_ARRAY } from '../../common/utility';
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
  isShippingMethodLoading: boolean;
  isShippingStepPending: boolean;
  methodId?: string;
  shippingAddress?: Address;
  shouldShowMultiShipping: boolean;
  shouldShowOrderComments: boolean;
  onReady?(): void;
  onUnhandledError(error: Error): void;
  onSubmit(values: SingleShippingFormValues): void;
  onMultiShippingChange(): void;
  loadShippingAddressFields(): Promise<CheckoutSelectors>;
  loadShippingOptions(): Promise<CheckoutSelectors>;
  updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

const StripeShipping = ({
  isBillingSameAsShipping,
  shouldShowMultiShipping,
  updateAddress,
  isMultiShippingMode,
  step,
  onSubmit,
  onMultiShippingChange,
  isLoading,
  isShippingMethodLoading,
  ...shippingFormProps
}: StripeShippingProps): ReactNode => {
  const { checkoutService, checkoutState } = useCheckout();

  const {
    data: {
      getCheckout,
      getCustomer,
      getConsignments,
      getShippingAddressFields,
      getShippingCountries,
    },
  } = checkoutState;
  const checkout = getCheckout();
  const consignments = getConsignments() || [];
  const customer = getCustomer();

  const initialize = checkoutService.initializeShipping;
  const deinitialize = checkoutService.deinitializeShipping;

  const countries = getShippingCountries() || EMPTY_ARRAY;
  const getFields = getShippingAddressFields;

  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [isStripeAutoStep, setIsStripeAutoStep] = useState(false);

  const stripeLoadedCallback = () => {
    setIsStripeLoading(false);
  };

  const handleIsAutoStep = () => {
    setIsStripeAutoStep(true);
  };

  if (!checkout || !customer) {
    return null;
  }

  const customerMessage = checkout.customerMessage;
  const isGuest = customer.isGuest;

  return (
    <>
      <AddressFormSkeleton isLoading={isStripeAutoStep || isStripeLoading} />
      <div
        className="checkout-form"
        style={{ display: isStripeAutoStep || isStripeLoading ? 'none' : undefined }}
      >
        <ShippingHeader
          isGuest={isGuest}
          isMultiShippingMode={isMultiShippingMode}
          onMultiShippingChange={onMultiShippingChange}
          shouldShowMultiShipping={shouldShowMultiShipping}
        />
        <StripeShippingForm
          consignments={consignments}
          countries={countries}
          customerMessage={customerMessage}
          getFields={getFields}
          {...shippingFormProps}
          deinitialize={deinitialize}
          initialize={initialize}
          isBillingSameAsShipping={isBillingSameAsShipping}
          isLoading={isLoading}
          isMultiShippingMode={isMultiShippingMode}
          isShippingMethodLoading={isShippingMethodLoading}
          isStripeAutoStep={handleIsAutoStep}
          isStripeLoading={stripeLoadedCallback}
          onSubmit={onSubmit}
          step={step}
          updateAddress={updateAddress}
        />
      </div>
    </>
  );
};

export default StripeShipping;
