import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';

import { getCardInstrument } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentMenu from './BraintreeAcceleratedCheckoutInstrumentMenu';

describe('BraintreeAcceleratedCheckoutInstrumentMenu', () => {
    it('shows all select instrument menu', () => {
        render(
            <BraintreeAcceleratedCheckoutInstrumentMenu
                instruments={[getCardInstrument()]}
                onSelectInstrument={noop}
                onUseNewInstrument={noop}
            />,
        );

        expect(screen.getByTestId('instrument-select-option')).toBeInTheDocument();
        expect(screen.getByTestId('instrument-select-option-use-new')).toBeInTheDocument();
    });
});
