import { mount } from 'enzyme';
import React, { Context, createContext, FunctionComponent } from 'react';

import createInjectHoc from './createInjectHoc';

interface FooContextProps {
    count: number;
    message: string;
}

describe('createInjectHoc()', () => {
    let contextValue: FooContextProps;
    let FooContext: Context<FooContextProps>;

    beforeEach(() => {
        contextValue = {
            count: 123,
            message: 'foobar',
        };

        FooContext = createContext(contextValue);
    });

    it('creates HOC that injects additional props from context', () => {
        const withFoo = createInjectHoc(FooContext);
        const Inner = () => <div />;
        const Outer = withFoo(Inner);

        expect(
            mount(<Outer />)
                .find(Inner)
                .props(),
        ).toEqual(contextValue);
    });

    it('creates HOC that injects additional props picked from context', () => {
        const withFoo = createInjectHoc(FooContext, {
            pickProps: (_, key) => key === 'count',
        });
        const Inner = () => <div />;
        const Outer = withFoo(Inner);

        expect(
            mount(<Outer />)
                .find(Inner)
                .props(),
        ).toEqual({ count: contextValue.count });
    });

    it('creates HOC that passes outer props to inner component', () => {
        const withFoo = createInjectHoc(FooContext);
        const Inner: FunctionComponent<{ abc: string }> = () => <div />;
        const Outer = withFoo(Inner);

        expect(
            mount(<Outer abc="abc" />)
                .find(Inner)
                .props(),
        ).toEqual({
            ...contextValue,
            abc: 'abc',
        });
    });

    it('creates HOC with display name', () => {
        const withFoo = createInjectHoc(FooContext, {
            displayNamePrefix: 'withFoo',
        });
        const Inner = () => <div />;
        const Outer = withFoo(Inner);

        expect(mount(<Outer />).name()).toBe('withFoo(Inner)');
    });
});
