import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import StripeShippingAddressDisplay, { StripeupeShippingAddressProps } from './StripeShippingAddressDisplay';

describe('StripeUpe Shipping Component', () => {
    const defaultProps: StripeupeShippingAddressProps = {
        methodId: 'stripeupe',
        initialize: jest.fn(),
        deinitialize: jest.fn(),
        onUnhandledError: jest.fn(),
    };

    it('calls initialize prop on mount', () => {
        render(<StripeShippingAddressDisplay { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        render(<StripeShippingAddressDisplay { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls onUnhandledError if initialize was failed', () => {
        defaultProps.initialize = jest.fn(() => { throw new Error(); });

        render(<StripeShippingAddressDisplay { ...defaultProps } />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls onUnhandledError if deinitialize was failed', async () => {
        defaultProps.deinitialize = jest.fn(() => {
            throw new Error();
        });

        render(<StripeShippingAddressDisplay { ...defaultProps } />).unmount();

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

});
