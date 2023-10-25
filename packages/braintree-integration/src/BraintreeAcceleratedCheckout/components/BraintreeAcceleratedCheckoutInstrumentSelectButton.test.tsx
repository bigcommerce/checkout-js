import '@testing-library/jest-dom';
import React from 'react';

import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentSelectButton from './BraintreeAcceleratedCheckoutInstrumentSelectButton';

describe('BraintreeAcceleratedCheckoutInstrumentSelectButton', () => {
    it('shows "new vaulted instrument" button if no instruments were provided', () => {
        render(<BraintreeAcceleratedCheckoutInstrumentSelectButton />);

        expect(screen.getByTestId('instrument-select-option-use-new')).toBeInTheDocument();
        expect(screen.queryByTestId('instrument-select-button')).not.toBeInTheDocument();
    });

    it('shows vaulted instrument button if instrument was provided', () => {
        const instrument = getCardInstrument();

        render(<BraintreeAcceleratedCheckoutInstrumentSelectButton instrument={instrument} />);

        expect(screen.getByTestId('instrument-select-button')).toBeInTheDocument();
        expect(screen.queryByTestId('instrument-select-option-use-new')).not.toBeInTheDocument();
    });
});
