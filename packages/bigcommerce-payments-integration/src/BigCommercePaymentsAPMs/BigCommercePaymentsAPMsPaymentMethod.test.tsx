import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';

import { getBigCommercePaymentsAPMsMethod } from '../mocks/paymentMethods.mock';

import BigCommercePaymentsAPMsPaymentMethod from './BigCommercePaymentsAPMsPaymentMethod';

describe('BigCommercePaymentsAPMsPaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const paymentForm: PaymentFormService = getPaymentFormServiceMock();

    const props = {
        method: getBigCommercePaymentsAPMsMethod(),
        checkoutService,
        checkoutState,
        paymentForm,
        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
    });

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
        const { container } = render(<BigCommercePaymentsAPMsPaymentMethod {...localProps} />);

        expect(container).toBeEmptyDOMElement();
    });
});
