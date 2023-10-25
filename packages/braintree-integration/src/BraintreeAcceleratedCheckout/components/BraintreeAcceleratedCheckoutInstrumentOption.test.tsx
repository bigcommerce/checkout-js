import '@testing-library/jest-dom';
import React from 'react';

import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentOption from './BraintreeAcceleratedCheckoutInstrumentOption';

describe('BraintreeAcceleratedCheckoutInstrumentOption', () => {
    const instrument = getCardInstrument();

    it('shows instrument option', () => {
        render(<BraintreeAcceleratedCheckoutInstrumentOption instrument={instrument} />);

        expect(screen.getByTestId('instrument-select-option')).toBeInTheDocument();
    });
});
