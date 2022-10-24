import { mount, render, shallow } from 'enzyme';
import React from 'react';

import { getFormFields } from '../../address/formField.mock';

import StripeShippingAddressDisplay, { StripeupeShippingAddressProps } from './StripeShippingAddressDisplay';

describe('StripeUpe Shipping Component', () => {
    const defaultProps: StripeupeShippingAddressProps = {
        formFields: getFormFields(),
        methodId: 'stripeupe',
        initialize: jest.fn(),
        deinitialize: jest.fn(),
        isLoading: false,
        countries: 'US,MX',
        onUnhandledError: jest.fn(),
    };

    it('matches snapshot', () => {
        const component = render(<StripeShippingAddressDisplay { ...defaultProps } />);

        expect(component).toMatchSnapshot();
    });

    it('calls initialize prop on mount', () => {
        shallow(<StripeShippingAddressDisplay { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        shallow(<StripeShippingAddressDisplay { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls onUnhandledError if initialize was failed', () => {
        defaultProps.initialize = jest.fn(() => { throw new Error(); });

        mount(<StripeShippingAddressDisplay { ...defaultProps } />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls onUnhandledError if deinitialize was failed', async () => {
        defaultProps.deinitialize = jest.fn(() => {
            throw new Error();
        });

        mount(<StripeShippingAddressDisplay { ...defaultProps } />).unmount();

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

});
