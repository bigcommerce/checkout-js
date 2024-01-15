import '@testing-library/jest-dom';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceAcceleratedCheckoutCreditCardForm from './PayPalCommerceAcceleratedCheckoutCreditCardForm';

describe('PayPalCommerceAcceleratedCheckoutCreditCardForm', () => {
    const renderPayPalConnectCardComponentMock = (container: string) => {
        const element = document.createElement('div');

        element.textContent = 'Here should be rendered PayPal Connect Credit Card form';

        // eslint-disable-next-line testing-library/no-node-access
        document.querySelector(container)?.append(element);
    };

    it('shows the result of the renderPayPalConnectComponent method call', async () => {
        render(
            <PayPalCommerceAcceleratedCheckoutCreditCardForm
                renderPayPalConnectCardComponent={renderPayPalConnectCardComponentMock}
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(
            screen.getByText('Here should be rendered PayPal Connect Credit Card form'),
        ).toBeInTheDocument();
    });
});
