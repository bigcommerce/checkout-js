import { mount, shallow } from 'enzyme';
import React from 'react';

import { SignOutLink } from '../payment';

import RemoteShippingAddress, { RemoteShippingAddressProps } from './RemoteShippingAddress';

describe('RemoteShippingAddress Component', () => {
    const defaultProps: RemoteShippingAddressProps = {
        containerId: 'container',
        methodId: 'amazon',
        onSignOut: jest.fn(),
        initialize: jest.fn(),
        deinitialize: jest.fn(),
    };

    it('renders widget', () => {
        const component = shallow(<RemoteShippingAddress { ...defaultProps } />);

        expect(component.find('#container').hasClass('widget--amazon')).toBeTruthy();
    });

    it('renders SignOutLink', () => {
        const component = shallow(<RemoteShippingAddress { ...defaultProps } />);

        expect(component.find(SignOutLink).props()).toEqual(expect.objectContaining({
            onSignOut: defaultProps.onSignOut,
            method: { id: defaultProps.methodId },
        }));
    });

    it('calls initialize prop on mount', () => {
        mount(<RemoteShippingAddress { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        mount(<RemoteShippingAddress { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });
});
