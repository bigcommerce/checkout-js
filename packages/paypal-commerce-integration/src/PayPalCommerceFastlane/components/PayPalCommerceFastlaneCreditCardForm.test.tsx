import '@testing-library/jest-dom';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceFastlaneCreditCardForm from './PayPalCommerceFastlaneCreditCardForm';

describe('PayPalCommerceFastlaneCreditCardForm', () => {
    const renderPayPalCardComponentMock = (container: string) => {
        const element = document.createElement('div');

        element.textContent = 'Here should be rendered PayPal Fastlane Credit Card form';

        // eslint-disable-next-line testing-library/no-node-access
        document.querySelector(container)?.append(element);
    };

    it('shows the result of the renderPayPalCardComponent method call', async () => {
        render(
            <PayPalCommerceFastlaneCreditCardForm
                renderPayPalCardComponent={renderPayPalCardComponentMock}
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(
            screen.getByText('Here should be rendered PayPal Fastlane Credit Card form'),
        ).toBeInTheDocument();
    });
});
