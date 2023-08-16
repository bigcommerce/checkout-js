import { render } from '@testing-library/react';
import React from 'react';

import BraintreeAcceleratedCheckoutInstrumentUseNewButton from './BraintreeAcceleratedCheckoutInstrumentUseNewButton';

describe('BraintreeAcceleratedCheckoutInstrumentUseNewButton', () => {
    it('renders "new vaulted instrument" button', () => {
        const view = render(<BraintreeAcceleratedCheckoutInstrumentUseNewButton />);

        expect(view).toMatchSnapshot();
    });
});
