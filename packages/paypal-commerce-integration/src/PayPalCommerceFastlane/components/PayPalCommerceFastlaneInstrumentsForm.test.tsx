import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceFastlaneInstrumentsForm from './PayPalCommerceFastlaneInstrumentsForm';

describe('PayPalCommerceAcceleratedCheckoutInstrumentsForm', () => {
    const selectedInstrumentMock = getCardInstrument();

    it('renders instruments form with provided props', () => {
        const { container } = render(
            <PayPalCommerceFastlaneInstrumentsForm
                handleSelectInstrument={jest.fn()}
                onChange={jest.fn()}
                selectedInstrument={selectedInstrumentMock}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it('updates selected instrument if user selects another instrument in paypal fastlane popup', async () => {
        const newInstrument = {
            ...selectedInstrumentMock,
            bigpayToken: 'newInstrumentNonce123',
            last4: '0004',
        };

        const onChange = (): Promise<CardInstrument> => Promise.resolve(newInstrument);
        const handleSelectInstrument = jest.fn();

        render(
            <PayPalCommerceFastlaneInstrumentsForm
                handleSelectInstrument={handleSelectInstrument}
                onChange={onChange}
                selectedInstrument={selectedInstrumentMock}
            />,
        );

        const actionButton = screen.getByTestId('paypal-commerce-fastlane-instrument-change');

        fireEvent.click(actionButton);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSelectInstrument).toHaveBeenCalledWith(newInstrument);
    });
});
