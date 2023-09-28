import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentUseNewButton from './BraintreeAcceleratedCheckoutInstrumentUseNewButton';

describe('BraintreeAcceleratedCheckoutInstrumentUseNewButton', () => {
    it('renders "new vaulted instrument" button', () => {
        const view = render(<BraintreeAcceleratedCheckoutInstrumentUseNewButton />);

        expect(view).toMatchSnapshot();
    });
});
