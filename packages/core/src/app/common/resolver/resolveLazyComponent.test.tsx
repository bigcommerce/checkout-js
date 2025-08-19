import React, { type ComponentType } from 'react';

import { toResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import resolveLazyComponent from './resolveLazyComponent';

describe('resolveComponent', () => {
    interface TestingProps {
        message: string;
    }

    let props: TestingProps;
    let components: Record<string, ComponentType<TestingProps>>;
    let registry: Record<string, Array<{ id?: string; gateway?: string; type?: string; default?: boolean }>>;

    beforeEach(() => {
        props = {
            message: 'Testing 123',
        };

        const Foo = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foo: {message}</div>,
            [{ id: 'foo', gateway: undefined, type: 'api' }],
        );

        const Bar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Bar: {message}</div>,
            [{ id: 'bar', gateway: undefined, type: 'hosted' }],
        );

        const Foobar = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foobar: {message}</div>,
            [{ id: 'foo', gateway: 'bar', type: 'hosted' }],
        );

        components = { Foo, Bar, Foobar };
        registry = {
            Foo: [{ id: 'foo', gateway: undefined, type: 'api' }],
            Bar: [{ id: 'bar', gateway: undefined, type: 'hosted' }],
            Foobar: [{ id: 'foo', gateway: 'bar', type: 'hosted' }],
        };
    });

    it('returns component if able to resolve to one by id', () => {
        const Foo = resolveLazyComponent({ id: 'foo' }, components, registry);

        if (Foo) {
            render(<Foo {...props} />);

            expect(screen.getByText(/Foo: Testing 123/)).toBeInTheDocument();
        }

        expect(Foo).toBeDefined();
    });

    it('returns component if able to resolve to one by type', () => {
        const Bar = resolveLazyComponent({ type: 'hosted' }, components, registry);

        if (Bar) {
            render(<Bar {...props} />);

            expect(screen.getByText(/Bar: Testing 123/)).toBeInTheDocument();
        }

        expect(Bar).toBeDefined();
    });

    it('returns component if able to resolve to one by id and gateway', () => {
        const Foobar = resolveLazyComponent({ id: 'foo', gateway: 'bar' }, components, registry);

        if (Foobar) {
            render(<Foobar {...props} />);

            expect(screen.getByText(/Foobar: Testing 123/)).toBeInTheDocument();
        }

        expect(Foobar).toBeDefined();
    });

    it('returns undefined if unable to resolve to one', () => {
        expect(resolveLazyComponent({ type: 'hello' }, components, registry)).toBeUndefined();
    });

    it('returns default component if configured and unable to resolve by id', () => {
        const Default = toResolvableComponent(
            ({ message }: TestingProps) => <div>Default: {message}</div>,
            [{ default: true }],
        );
        const registryWithDefault: Record<string, Array<{ id?: string; default?: boolean }>> = {
            Default: [{ default: true }],
        };

        expect(resolveLazyComponent({ id: 'hello_world' }, { ...components, Default }, registryWithDefault)).toEqual(
            Default,
        );
    });

    it('returns correct component for an entry', () => {
        const Component = toResolvableComponent(
            ({ message }: TestingProps) => <div>Foo: {message}</div>,
            [{ id: 'credit_card', gateway: 'bluesnap' }]
        );
        const registryWithComponent: Record<string, Array<{ id?: string; gateway?: string }>> = {
            Component: [{ id: 'credit_card', gateway: 'bluesnap' }],
        };

        const CreditCard = resolveLazyComponent(
            { id: 'credit_card' },
            { Component },
            registryWithComponent
        );

        const Bluesnap = resolveLazyComponent(
            { id: 'credit_card' },
            { Component },
            registryWithComponent
        );

        const CheckoutCom = resolveLazyComponent(
            { id: 'credit_card', gateway: 'checkoutcom' },
            { Component },
            registryWithComponent
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
        const registryWithComponent: Record<string, Array<{ id?: string; gateway?: string }>> = {
            GatewayComponent: [{ gateway: 'somegateway' }],
        };

        const AGateway = resolveLazyComponent(
            { id: 'test', gateway: 'somegateway' },
            { GatewayComponent },
            registryWithComponent
        );

        const BGateway = resolveLazyComponent(
            { id: 'bar', gateway: 'somegateway' },
            { GatewayComponent },
            registryWithComponent
        );

        const CGateway = resolveLazyComponent(
            { id: 'foo', gateway: 'somegateway' },
            { GatewayComponent },
            registryWithComponent
        );

        expect(AGateway).toBeDefined();
        expect(BGateway).toBeDefined();
        expect(CGateway).toBeDefined();
    });
});
