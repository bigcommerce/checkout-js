import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React from 'react';

import CheckoutProvider from './CheckoutProvider';

describe('CheckoutProvider', () => {
    it('subscribes to state changes when component is mounted', () => {
        const service = createCheckoutService();

        jest.spyOn(service, 'subscribe');

        render(<CheckoutProvider checkoutService={service} />);

        expect(service.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes to state changes when component unmounts', () => {
        const service = createCheckoutService();
        const unsubscribe = jest.fn();

        jest.spyOn(service, 'subscribe').mockReturnValue(unsubscribe);

        const { unmount } = render(<CheckoutProvider checkoutService={service} />);

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
