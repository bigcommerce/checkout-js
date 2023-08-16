import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { getCardInstrument } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentOption from './BraintreeAcceleratedCheckoutInstrumentOption';

describe('BraintreeAcceleratedCheckoutInstrumentOption', () => {
    const instrument = getCardInstrument();

    it('shows instrument option', () => {
        render(<BraintreeAcceleratedCheckoutInstrumentOption instrument={instrument} />);

        expect(screen.getByTestId('instrument-select-option')).toBeInTheDocument();
    });
});
