import {
    Checkout,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';



import { CheckoutProvider } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

import CheckoutButton, { CheckoutButtonProps } from './CheckoutButton';

describe('CheckoutButton', () => {
    
    let CheckoutButtonTest: FunctionComponent<CheckoutButtonProps>;
    let checkout: Checkout;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkout = getCheckout();
        checkoutService = createCheckoutService();


        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);

        CheckoutButtonTest = (props: CheckoutButtonProps) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <CheckoutButton {...props}/>
            </CheckoutProvider>
        );
    });

    it('initializes button when component is mounted', () => {
        const initialize = jest.fn();
        const onError = jest.fn();

        mount(
            <CheckoutButtonTest
                containerId="foobarContainer"
                deinitialize={noop}
                initialize={initialize}
                methodId="foobar"
                onError={onError}
            />,
        );

        expect(initialize).toHaveBeenCalledWith({
            methodId: 'foobar',
            foobar: {
                container: 'foobarContainer',
                onError,
            },
        });
    });

    it('re-renders button when cart balance updated', () => {
        const initialize = jest.fn();
        const deinitialize = jest.fn();

        const component = mount(
            <CheckoutButtonTest
                containerId="foobarContainer"
                deinitialize={deinitialize}
                initialize={initialize}
                methodId="foobar"
                onError={noop}
            />,
        );

        component.setProps({ outstandingBalance: checkout.outstandingBalance - 20 });

        expect(initialize).toHaveBeenCalledTimes(2);
        expect(deinitialize).toHaveBeenCalledTimes(1);
    });

    it("doesn't re-render button when cart balance updated with same value", () => {
        const initialize = jest.fn();
        const deinitialize = jest.fn();

        const component = mount(
            <CheckoutButtonTest
                containerId="foobarContainer"
                deinitialize={deinitialize}
                initialize={initialize}
                methodId="foobar"
                onError={noop}
            />,
        );

        component.setProps({ outstandingBalance: checkout.outstandingBalance });

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(deinitialize).toHaveBeenCalledTimes(0);
    });

    it('deinitializes button when component unmounts', () => {
        const deinitialize = jest.fn();
        const onError = jest.fn();

        const component = mount(
            <CheckoutButtonTest
                containerId="foobarContainer"
                deinitialize={deinitialize}
                initialize={noop}
                methodId="foobar"
                onError={onError}
            />,
        );

        component.unmount();

        expect(deinitialize).toHaveBeenCalled();
    });
});
