import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { RenderResult } from '@testing-library/react';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';


import { getAddressFormFields } from '../../address/formField.mock';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import ConsoleErrorLogger from '../../common/error/ConsoleErrorLogger';
import { getCustomer } from '../../customer/customers.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import StripeShipping, { StripeShippingProps } from './StripeShipping';


describe('Stripe Shipping Component', () => {
    const checkoutService = createCheckoutService();
    const addressFormFields = getAddressFormFields().filter(({ custom }) => !custom);
    const errorLogger = new ConsoleErrorLogger();
    let component: RenderResult;

    const defaultProps: StripeShippingProps = {
        isNewMultiShippingUIEnabled: false,
        step: {
            isActive: true,
            isBusy: false,
            isComplete: false,
            isEditable: true,
            isRequired: true,
            type: CheckoutStepType.Shipping,
        },
        customer: getCustomer(),
        isGuest: true,
        isBillingSameAsShipping: false,
        isInitialValueLoaded: false,
        isMultiShippingMode: false,
        countries: [],
        shippingAddress: getShippingAddress(),
        customerMessage: '',
        shouldShowOrderComments: true,
        consignments: [],
        cartHasChanged: false,
        isLoading: false,
        isShippingStepPending: false,
        isInitializing: true,
        isShippingMethodLoading: true,
        shouldShowMultiShipping: false,
        loadShippingAddressFields: jest.fn(),
        loadShippingOptions: jest.fn(),
        onMultiShippingChange: jest.fn(),
        onSubmit: jest.fn(),
        getFields: jest.fn(() => addressFormFields),
        onUnhandledError: jest.fn(),
        deinitialize: jest.fn(),
        initialize: jest.fn(),
        updateAddress: jest.fn(),
    };

    beforeEach(() => {
       component = render(
            <CheckoutProvider checkoutService={checkoutService} >
                <LocaleProvider checkoutService={checkoutService}>
                    <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger}>
                        <StripeShipping {...defaultProps} />
                    </ExtensionProvider>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('loads shipping data  when component is mounted', () => {
        const { container } = component;

        expect(container.firstChild).toHaveClass('checkout-form')
        expect(defaultProps.initialize).toHaveBeenCalled();
    });
});
