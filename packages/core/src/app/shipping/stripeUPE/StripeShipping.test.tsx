import {
  type CheckoutSelectors,
  createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { type AnalyticsEvents, AnalyticsProviderMock } from '@bigcommerce/checkout/contexts';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import { getCart } from '../../cart/carts.mock';
import { getCheckout } from '../../checkout/checkouts.mock';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import ConsoleErrorLogger from '../../common/error/ConsoleErrorLogger';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import StripeShipping, { type StripeShippingProps } from './StripeShipping';

describe('Stripe Shipping Component', () => {
    const checkoutService = createCheckoutService();
    const errorLogger = new ConsoleErrorLogger();
    const initialize = jest.fn();
    let checkoutState: CheckoutSelectors;
    let analyticsTracker: Partial<AnalyticsEvents>;

   checkoutService.initializeShipping = initialize;

  const defaultProps: StripeShippingProps = {
        step: {
            isActive: true,
            isBusy: false,
            isComplete: false,
            isEditable: true,
            isRequired: true,
            type: CheckoutStepType.Shipping,
        },
        isBillingSameAsShipping: false,
        isInitialValueLoaded: false,
        isMultiShippingMode: false,
        cartHasChanged: false,
        isLoading: false,
        onMultiShippingChange: jest.fn(),
        onSubmit: jest.fn(),
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
      checkoutState = checkoutService.getState();
      analyticsTracker = {
          checkoutBegin: jest.fn(),
          trackStepViewed: jest.fn(),
          trackStepCompleted: jest.fn(),
          exitCheckout: jest.fn(),
      };
      jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
      jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
      jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
      jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
    });

    it('loads shipping data  when component is mounted', async () => {
      const { container } = render(
        <CheckoutProvider checkoutService={checkoutService}>
          <LocaleProvider checkoutService={checkoutService}>
            <AnalyticsProviderMock analyticsTracker={analyticsTracker}>
              <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger}>
                <StripeShipping {...defaultProps} />
              </ExtensionProvider>
            </AnalyticsProviderMock>
          </LocaleProvider>
        </CheckoutProvider>,
      );

      // eslint-disable-next-line testing-library/no-container
      expect(container.querySelector('.address-form-skeleton')).toBeInTheDocument();
      expect(initialize).toHaveBeenCalled();
    });
});
