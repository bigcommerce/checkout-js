import { render, screen } from '@testing-library/react';
import React, { createContext } from 'react';

import createInjectHoc from './createInjectHoc';

describe('createInjectHoc', () => {
    const TestContext = createContext<{ foo?: string; bar?: string }>({});

    const DummyComponent: React.FC<{ foo?: string; bar?: string; other?: string }> = ({
        foo,
        bar,
        other,
    }) => (
        <div>
            {Boolean(foo) && <span data-test="foo">{foo}</span>}
            {Boolean(bar) && <span data-test="bar">{bar}</span>}
            {Boolean(other) && <span data-test="other">{other}</span>}
        </div>
    );

    it('renders component with injected context props', () => {
        const Injected = createInjectHoc(TestContext)(DummyComponent);

        render(
            <TestContext.Provider value={{ foo: 'hello', bar: 'world' }}>
                <Injected other="prop" />
            </TestContext.Provider>,
        );

        expect(screen.getByTestId('foo')).toHaveTextContent('hello');
        expect(screen.getByTestId('bar')).toHaveTextContent('world');
        expect(screen.getByTestId('other')).toHaveTextContent('prop');
    });

    it('filters context props using pickProps', () => {
        const pickProps = (_: string, key: string) => key === 'foo';

        const Injected = createInjectHoc(TestContext, { pickProps })(DummyComponent);

        render(
            <TestContext.Provider value={{ foo: 'keep me', bar: 'remove me' }}>
                <Injected />
            </TestContext.Provider>,
        );

        expect(screen.getByTestId('foo')).toHaveTextContent('keep me');
        expect(screen.queryByTestId('bar')).not.toBeInTheDocument();
    });

    it('renders null when injected props are empty', () => {
        const Injected = createInjectHoc(TestContext)(DummyComponent);

        const { container } = render(
            <TestContext.Provider value={{}}>
                <Injected />
            </TestContext.Provider>,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('sets displayName when displayNamePrefix is provided', () => {
        const Injected = createInjectHoc(TestContext, { displayNamePrefix: 'WithContext' })(
            DummyComponent,
        );

        expect(Injected.displayName).toBe('WithContext(DummyComponent)');
    });

    it('sets displayName using component displayName if available', () => {
        const NamedComponent = () => null;

        NamedComponent.displayName = 'CustomName';

        const Injected = createInjectHoc(TestContext, { displayNamePrefix: 'Wrapper' })(
            NamedComponent,
        );

        expect(Injected.displayName).toBe('Wrapper(CustomName)');
    });
});
