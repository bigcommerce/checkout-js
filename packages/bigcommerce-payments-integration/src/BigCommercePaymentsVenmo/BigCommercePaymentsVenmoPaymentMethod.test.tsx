import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

import { getBigCommercePaymentsVenmoMethod } from '../mocks/paymentMethods.mock';

import BigCommercePaymentsVenmoPaymentMethod from './BigCommercePaymentsVenmoPaymentMethod';

describe('BigCommercePaymentsVenmoPaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getBigCommercePaymentsVenmoMethod(),
        checkoutService,
        checkoutState,

        paymentForm: jest.fn() as unknown as PaymentFormService,

        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    it('renders nothing if Payment Data is not Required', () => {
        const mockChild = <div>test child</div>;
        const localProps = {
            ...props,
            checkoutState: {
                ...checkoutState,
                data: {
                    ...checkoutState.data,
                    isPaymentDataRequired: jest.fn().mockReturnValue(false),
                },
            },
            children: mockChild,
        };
        const { container } = render(<BigCommercePaymentsVenmoPaymentMethod {...localProps} />);

        expect(container).toBeEmptyDOMElement();
    });
});
