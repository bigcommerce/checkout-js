import { render } from 'enzyme';
import React from 'react';

import { getPaymentMethod } from '../../payment/payment-methods.mock';

import resolvePaymentMethod from './resolvePaymentMethod';
import PaymentMethodProps from './PaymentMethodProps';

jest.mock('../../generated/paymentIntegrations', () => {
    const { default: toResolvableComponent } = jest.requireActual('./toResolvableComponent');

    const Foo = toResolvableComponent(
        () => <div>Foo</div>,
        [{ id: 'foo', gateway: null, type: 'api' }]
    );

    const Bar = toResolvableComponent(
        () => <div>Bar</div>,
        [{ id: 'bar', gateway: null, type: 'hosted' }]
    );

    const Foobar = toResolvableComponent(
        () => <div>Foobar</div>,
        [{ id: 'foo', gateway: 'bar', type: 'hosted' }]
    );

    return { Foo, Bar, Foobar };
});

describe('resolvePaymentMethod()', () => {
    let props: PaymentMethodProps;

    beforeEach(() => {
        props = {
            method: getPaymentMethod(),
        } as PaymentMethodProps;
    });

    it('returns component if able to resolve to one by id', () => {
        const Foo = resolvePaymentMethod({ id: 'foo' });

        expect(Foo)
            .toBeDefined();
        expect(render(<Foo { ...props } />).text())
            .toEqual('Foo');
    });

    it('returns component if able to resolve to one by type', () => {
        const Bar = resolvePaymentMethod({ type: 'hosted' });

        expect(Bar)
            .toBeDefined();
        expect(render(<Bar { ...props } />).text())
            .toEqual('Bar');
    });

    it('returns component if able to resolve to one by id and gateway', () => {
        const Foobar = resolvePaymentMethod({ id: 'foo', gateway: 'bar' });

        expect(Foobar)
            .toBeDefined();
        expect(render(<Foobar { ...props } />).text())
            .toEqual('Foobar');
    });

    it('throws error if unable to resolve to one', () => {
        expect(() => resolvePaymentMethod({ type: 'hello' }))
            .toThrowError();
    });
});
