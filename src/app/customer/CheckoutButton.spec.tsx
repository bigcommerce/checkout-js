import { mount } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
    it('initializes button when component is mounted', () => {
        const initialize = jest.fn();
        const onError = jest.fn();

        mount(
            <CheckoutButton
                containerId="foobarContainer"
                methodId="foobar"
                deinitialize={ noop }
                initialize={ initialize }
                onError={ onError }
            />
        );

        expect(initialize)
            .toHaveBeenCalledWith({
                methodId: 'foobar',
                foobar: {
                    container: 'foobarContainer',
                    onError,
                },
            });
    });

    it('deinitializes button when component unmounts', () => {
        const deinitialize = jest.fn();
        const onError = jest.fn();

        const component = mount(
            <CheckoutButton
                containerId="foobarContainer"
                methodId="foobar"
                deinitialize={ deinitialize }
                initialize={ noop }
                onError={ onError }
            />
        );

        component.unmount();

        expect(deinitialize)
            .toHaveBeenCalled();
    });
});
