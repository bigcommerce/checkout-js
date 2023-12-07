import { mount } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
    it('initializes button when component is mounted', () => {
        const initialize = jest.fn();
        const onError = jest.fn();
        const onClick = jest.fn();

        mount(
            <CheckoutButton
                containerId="foobarContainer"
                deinitialize={noop}
                initialize={initialize}
                methodId="foobar"
                onError={onError}
                onClick={onClick}
            />,
        );

        expect(initialize).toHaveBeenCalledWith({
            methodId: 'foobar',
            foobar: {
                container: 'foobarContainer',
                onError,
                onClick: expect.any(Function),
            },
        });
    });

    it('deinitializes button when component unmounts', () => {
        const deinitialize = jest.fn();
        const onError = jest.fn();
        const onClick = jest.fn();

        const component = mount(
            <CheckoutButton
                containerId="foobarContainer"
                deinitialize={deinitialize}
                initialize={noop}
                methodId="foobar"
                onError={onError}
                onClick={onClick}
            />,
        );

        component.unmount();

        expect(deinitialize).toHaveBeenCalled();
    });
});
