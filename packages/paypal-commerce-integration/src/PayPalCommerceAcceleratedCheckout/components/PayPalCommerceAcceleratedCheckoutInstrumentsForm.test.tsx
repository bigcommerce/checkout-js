import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';

import PayPalCommerceAcceleratedCheckoutInstrumentsForm from './PayPalCommerceAcceleratedCheckoutInstrumentsForm';
import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { fireEvent } from '@testing-library/react';

describe('PayPalCommerceAcceleratedCheckoutInstrumentsForm', () => {
    const selectedInstrumentMock = getCardInstrument();

    it('renders instruments form with provided props', () => {
        const { container } = render(
            <PayPalCommerceAcceleratedCheckoutInstrumentsForm
                handleSelectInstrument={jest.fn()}
                onChange={jest.fn()}
                selectedInstrument={selectedInstrumentMock}
            />
        );

        expect(container).toMatchSnapshot();
    });

    it('updates selected instrument if user selects another instrument in paypal connect popup', async () => {
        const newInstrument = {
            ...selectedInstrumentMock,
            bigpayToken: 'newInstrumentNonce123',
            last4: '0004',
        };

        const onChange = (): Promise<CardInstrument> => Promise.resolve(newInstrument);
        const handleSelectInstrument = jest.fn();

        render(
            <PayPalCommerceAcceleratedCheckoutInstrumentsForm
                handleSelectInstrument={handleSelectInstrument}
                onChange={onChange}
                selectedInstrument={selectedInstrumentMock}
            />
        );

        const actionButton = screen.getByTestId('paypal-commerce-connect-instrument-change');

        fireEvent.click(actionButton);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSelectInstrument).toHaveBeenCalledWith(newInstrument);
    });
});
