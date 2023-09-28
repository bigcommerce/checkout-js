import '@testing-library/jest-dom';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutCreditCardForm from './BraintreeAcceleratedCheckoutCreditCardForm';

describe('BraintreeAcceleratedCheckoutCreditCardForm', () => {
    const renderPayPalConnectComponentMock = (container: string) => {
        const element = document.createElement('div');

        element.textContent = 'Here should be rendered PayPal Connect Credit Card form';

        // eslint-disable-next-line testing-library/no-node-access
        document.querySelector(container)?.append(element);
    };

    it('shows the result of the renderPayPalConnectComponent method call', async () => {
        render(
            <BraintreeAcceleratedCheckoutCreditCardForm
                renderPayPalConnectComponent={renderPayPalConnectComponentMock}
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(
            screen.getByText('Here should be rendered PayPal Connect Credit Card form'),
        ).toBeInTheDocument();
    });
});
