import { noop } from 'lodash';
import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
    it('initializes button when component is mounted', () => {
        const initialize = jest.fn();
        const onError = jest.fn();

        render(
            <CheckoutButton
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

    it('deinitializes button when component unmounts', () => {
        const deinitialize = jest.fn();
        const onError = jest.fn();

        const { unmount } = render(
            <CheckoutButton
                containerId="foobarContainer"
                deinitialize={deinitialize}
                initialize={noop}
                methodId="foobar"
                onError={onError}
            />,
        );

        unmount();

        expect(deinitialize).toHaveBeenCalled();
    });
});
