import { createCheckoutService, CheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../checkout';

import SpamProtectionField, { SpamProtectionProps } from './SpamProtectionField';

describe('SpamProtectionField', () => {
    let checkoutService: CheckoutService;
    let SpamProtectionTest: FunctionComponent<SpamProtectionProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService, 'executeSpamCheck')
            .mockResolvedValue(checkoutService.getState());

        SpamProtectionTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <SpamProtectionField { ...props } />
            </CheckoutProvider>
        );
    });

    it('renders spam protection field', () => {
        expect(render(<SpamProtectionTest />))
            .toMatchSnapshot();
    });
});
