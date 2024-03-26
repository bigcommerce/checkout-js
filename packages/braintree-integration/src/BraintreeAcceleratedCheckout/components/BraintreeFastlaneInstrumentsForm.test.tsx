import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';

import BraintreeFastlaneInstrumentsForm from './BraintreeFastlaneInstrumentsForm';
import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { fireEvent } from '@testing-library/react';

describe('BraintreeFastlaneInstrumentsForm', () => {
    const selectedInstrumentMock = getCardInstrument();

    it('renders instruments form with provided props', () => {
        const { container } = render(
            <BraintreeFastlaneInstrumentsForm
                handleSelectInstrument={jest.fn()}
                onChange={jest.fn()}
                selectedInstrument={selectedInstrumentMock}
            />,
        );

        expect(container).toMatchSnapshot();
    });

    it('updates selected instrument if user selects another instrument in braintree fastlane popup', async () => {
        const newInstrument = {
            ...selectedInstrumentMock,
            bigpayToken: 'newInstrumentNonce123',
            last4: '0004',
        };

        const onChange = (): Promise<CardInstrument> => Promise.resolve(newInstrument);
        const handleSelectInstrument = jest.fn();

        render(
            <BraintreeFastlaneInstrumentsForm
                handleSelectInstrument={handleSelectInstrument}
                onChange={onChange}
                selectedInstrument={selectedInstrumentMock}
            />,
        );

        const actionButton = screen.getByTestId('braintree-fastlane-instrument-change');

        fireEvent.click(actionButton);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSelectInstrument).toHaveBeenCalledWith(newInstrument);
    });
});
