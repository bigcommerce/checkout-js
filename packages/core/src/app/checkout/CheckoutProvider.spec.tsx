import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import CheckoutProvider from './CheckoutProvider';

describe('CheckoutProvider', () => {
    it('subscribes to state changes when component is mounted', () => {
        const service = createCheckoutService();

        jest.spyOn(service, 'subscribe');

        const component = mount(<CheckoutProvider checkoutService={service} />);

        expect(service.subscribe).toHaveBeenCalled();

        expect(component.state('checkoutState')).toEqual(service.getState());
    });

    it('unsubscribes to state changes when component unmounts', () => {
        const service = createCheckoutService();
        const unsubscribe = jest.fn();

        jest.spyOn(service, 'subscribe').mockReturnValue(unsubscribe);

        const component = mount(<CheckoutProvider checkoutService={service} />);

        component.unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
