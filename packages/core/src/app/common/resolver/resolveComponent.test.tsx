import React, { ComponentType } from 'react';

import { toResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

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
            ({ message }: TestingProps) => <div>Foo: {message}</div>,
            [{ id: 'foo', gateway: null, type: 'api' }],
        );

        const Bar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Bar: {message}</div>,
            [{ id: 'bar', gateway: null, type: 'hosted' }],
        );

        const Foobar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foobar: {message}</div>,
            [{ id: 'foo', gateway: 'bar', type: 'hosted' }],
        );

        components = { Foo, Bar, Foobar };
    });

    it('returns component if able to resolve to one by id', () => {
        const Foo = resolveComponent({ id: 'foo' }, components);

        if (Foo) {
            render(<Foo {...props} />);

            expect(screen.getByText(/Foo: Testing 123/)).toBeInTheDocument();
        }

        expect(Foo).toBeDefined();
    });

    it('returns component if able to resolve to one by type', () => {
        const Bar = resolveComponent({ type: 'hosted' }, components);

        if (Bar) {
            render(<Bar {...props} />);

            expect(screen.getByText(/Bar: Testing 123/)).toBeInTheDocument();
        }

        expect(Bar).toBeDefined();
    });

    it('returns component if able to resolve to one by id and gateway', () => {
        const Foobar = resolveComponent({ id: 'foo', gateway: 'bar' }, components);

        if (Foobar) {
            render(<Foobar {...props} />);

            expect(screen.getByText(/Foobar: Testing 123/)).toBeInTheDocument();
        }

        expect(Foobar).toBeDefined();
    });

    it('returns undefined if unable to resolve to one', () => {
        expect(resolveComponent({ type: 'hello' }, components)).toBeUndefined();
    });

    it('returns default component if configured and unable to resolve by id', () => {
        const Default = toResolvableComponent(
            ({ message }: TestingProps) => <div>Default: {message}</div>,
            [{ default: true }],
        );

        expect(resolveComponent({ id: 'hello_world' }, { ...components, Default })).toEqual(
            Default,
        );
    });

    it('returns correct component for an entry', () => {
        const Component = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foo: {message}</div>,
            [{ id: 'credit_card', gateway: 'bluesnap' }]
        );

        const CreditCard = resolveComponent(
            { id: 'credit_card' },
            { Component }
        );

        const Bluesnap = resolveComponent(
            { id: 'credit_card' },
            { Component }
        );

        const CheckoutCom = resolveComponent(
            { id: 'credit_card', gateway: 'checkoutcom' },
            { Component }
        );

        expect(CreditCard).toBeDefined();
        expect(Bluesnap).toBeDefined();
        expect(CheckoutCom).toBeUndefined();
    });

    it('returns correct component for an gateway/methodId key if registry is only done by gateway', () => {
        const GatewayComponent = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foo: {message}</div>,
            [{ gateway: 'somegateway' }]
        );

        const AGateway = resolveComponent(
            { id: 'test', gateway: 'somegateway' },
            { GatewayComponent }
        );

        const BGateway = resolveComponent(
            { id: 'bar', gateway: 'somegateway' },
            { GatewayComponent }
        );

        const CGateway = resolveComponent(
            { id: 'foo', gateway: 'somegateway' },
            { GatewayComponent }
        );

        expect(AGateway).toBeDefined();
        expect(BGateway).toBeDefined();
        expect(CGateway).toBeDefined();
    });
});
