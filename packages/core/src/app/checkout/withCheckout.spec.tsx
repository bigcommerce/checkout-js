import { Checkout, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout as getCheckoutMock } from './checkouts.mock';
import withCheckout from './withCheckout';

describe('withCheckout()', () => {
    it('provides checkout state to child component', () => {
        const withMockCheckout = withCheckout(
            ({
                checkoutState: {
                    data: { getCheckout },
                },
            }) => ({
                checkout: getCheckout(),
            }),
        );

        const Child = withMockCheckout(({ checkout }: { checkout: Checkout }) => (
            <>{checkout.id}</>
        ));

        const service = createCheckoutService();

        jest.spyOn(service.getState().data, 'getCheckout').mockReturnValue({
            ...getCheckoutMock(),
            id: '123',
        });

        const component = mount(
            <CheckoutProvider checkoutService={service}>
                <Child />
            </CheckoutProvider>,
        );

        expect(component.text()).toBe('123');
    });

    it('provides checkout service to child component', () => {
        const withMockCheckout = withCheckout(({ checkoutService }) => ({
            loadCheckout: () => {
                checkoutService.loadCheckout();
            },
        }));

        const Child = withMockCheckout(({ loadCheckout }: { loadCheckout(): void }) => (
            <button onClick={loadCheckout}>Load</button>
        ));

        const service = createCheckoutService();

        jest.spyOn(service, 'loadCheckout').mockReturnValue(Promise.resolve(service.getState()));

        const component = mount(
            <CheckoutProvider checkoutService={service}>
                <Child />
            </CheckoutProvider>,
        );

        component.find('button').simulate('click');

        expect(service.loadCheckout).toHaveBeenCalled();
    });

    it('does not update child if mapped props have not changed', () => {
        const withMockCheckout = withCheckout(
            ({
                checkoutState: {
                    data: { getCheckout },
                },
            }) => ({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                grandTotal: getCheckout()!.grandTotal,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                subtotal: getCheckout()!.subtotal,
            }),
        );

        const OriginalChild = jest.fn((props: { grandTotal: number; subtotal: number }) => (
            <>
                {props.grandTotal}
                {props.subtotal}
            </>
        ));

        const Child = withMockCheckout(OriginalChild);
        const service = createCheckoutService();

        jest.spyOn(service.getState().data, 'getCheckout').mockReturnValue(getCheckoutMock());

        const component = mount(
            <CheckoutProvider checkoutService={service}>
                <Child />
            </CheckoutProvider>,
        );

        expect(OriginalChild).toHaveBeenCalledTimes(1);

        component.update();

        expect(OriginalChild).toHaveBeenCalledTimes(1);
    });
});
