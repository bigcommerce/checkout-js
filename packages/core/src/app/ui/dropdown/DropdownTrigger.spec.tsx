import { mount } from 'enzyme';
import React from 'react';

import { CHECKOUT_ROOT_NODE_ID } from '../../checkout/CheckoutRootNodeId';

import DropdownTrigger from './DropdownTrigger';

describe('DropdownTrigger', () => {
    it('shows dropdown when mouse clicks', () => {
        const component = mount(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        component.simulate('click');

        expect(component.state('shouldShow')).toBe(true);
    });

    it('hides dropdown when mouse clicks again', () => {
        const component = mount(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        component.simulate('click');
        component.simulate('click');

        expect(component.state('shouldShow')).toBe(false);
    });

    it('hides dropdown when mouse clicks anywhere else in document', () => {
        const component = mount(
          <div id={CHECKOUT_ROOT_NODE_ID}>
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>
          </div>
        );

        component.simulate('click');
        document.getElementById(CHECKOUT_ROOT_NODE_ID)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(component.find('Hello world').exists()).toBe(false);
    });
});
