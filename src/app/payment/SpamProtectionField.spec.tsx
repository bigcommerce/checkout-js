import { createCheckoutService, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../checkout';

import SpamProtectionField, { SpamProtectionProps } from './SpamProtectionField';

describe('SpamProtectionField', () => {
    let checkoutService: CheckoutService;
    let SpamProtectionTest: FunctionComponent<SpamProtectionProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService, 'initializeSpamProtection')
            .mockResolvedValue(checkoutService.getState());

        SpamProtectionTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <SpamProtectionField { ...props } />
            </CheckoutProvider>
        );
    });

    it('intializes spam protection when component is mounted', () => {
        mount(<SpamProtectionTest containerId="spamProtection" />);

        expect(checkoutService.initializeSpamProtection)
            .toHaveBeenCalledWith({ containerId: 'spamProtection' });
    });

    it('renders spam protection field with the given container id', () => {
        expect(render(<SpamProtectionTest containerId="spamProtection" />))
            .toMatchSnapshot();
    });
});
