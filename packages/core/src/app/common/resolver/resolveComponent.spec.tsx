import { toResolvableComponent } from '@bigcommerce/checkout-js/payment-integration';
import { render } from 'enzyme';
import React, { ComponentType } from 'react';

import resolveComponent from './resolveComponent';

describe('resolveComponent', () => {
    interface TestingProps {
        message: string;
    }

    let props: TestingProps;
    let components: Record<string, ComponentType<TestingProps>>;

    beforeEach(() => {
        props = {
            message: 'Testing 123',
        };

        const Foo = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foo: { message }</div>,
            [{ id: 'foo', gateway: null, type: 'api' }]
        );

        const Bar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Bar: { message }</div>,
            [{ id: 'bar', gateway: null, type: 'hosted' }]
        );

        const Foobar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foobar: { message }</div>,
            [{ id: 'foo', gateway: 'bar', type: 'hosted' }]
        );

        components = { Foo, Bar, Foobar };
    });

    it('returns component if able to resolve to one by id', () => {
        const Foo = resolveComponent({ id: 'foo' }, components);

        expect(Foo)
            .toBeDefined();
        expect(Foo && render(<Foo { ...props } />).text())
            .toEqual('Foo: Testing 123');
    });

    it('returns component if able to resolve to one by type', () => {
        const Bar = resolveComponent({ type: 'hosted' }, components);

        expect(Bar)
            .toBeDefined();
        expect(Bar && render(<Bar { ...props } />).text())
            .toEqual('Bar: Testing 123');
    });

    it('returns component if able to resolve to one by id and gateway', () => {
        const Foobar = resolveComponent({ id: 'foo', gateway: 'bar' }, components);

        expect(Foobar)
            .toBeDefined();
        expect(Foobar && render(<Foobar { ...props } />).text())
            .toEqual('Foobar: Testing 123');
    });

    it('returns undefined if unable to resolve to one', () => {
        expect(resolveComponent({ type: 'hello' }, components))
            .toBeUndefined();
    });
});
