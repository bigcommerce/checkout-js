import { mount, shallow } from 'enzyme';
import React from 'react';

import { StaticAddress } from '../address/';
import { getAddress } from '../address/address.mock';
import { Button } from '../ui/button';

import StaticAddressEditable, { StaticAddressEditableProps } from './StaticAddressEditable';

describe('StaticAddressEditable Component', () => {
    let defaultProps: StaticAddressEditableProps;

    defaultProps = {
        address: getAddress(),
        buttonId: 'foo',
        isLoading: false,
        methodId: 'bar',
        initialize: jest.fn(),
        deinitialize: jest.fn(),
    };

    it('renders static address and button to edit', () => {
        const component = mount(<StaticAddressEditable { ...defaultProps } />);

        expect(component.find(StaticAddress).length)
            .toEqual(1);

        expect(component.find(Button).length)
            .toEqual(1);
    });

    it('calls initialize prop on mount', () => {
        shallow(<StaticAddressEditable { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        shallow(<StaticAddressEditable { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });
});
