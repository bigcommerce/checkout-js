import { mount } from 'enzyme';
import React from 'react';

import DropdownTrigger from './DropdownTrigger';

describe('DropdownTrigger', () => {
    it('shows dropdown when mouse clicks', () => {
        const component = mount(
            <DropdownTrigger dropdown={ <div>Hello world</div> }>
                <button>Foobar</button>
            </DropdownTrigger>
        );

        component.simulate('click');

        expect(component.state('shouldShow'))
            .toEqual(true);
    });

    it('hides dropdown when mouse clicks again', () => {
        const component = mount(
            <DropdownTrigger dropdown={ <div>Hello world</div> }>
                <button>Foobar</button>
            </DropdownTrigger>
        );

        component.simulate('click');
        component.simulate('click');

        expect(component.state('shouldShow'))
            .toEqual(false);
    });

    it('hides dropdown when mouse clicks anywhere else in document', () => {
        const component = mount(
            <DropdownTrigger dropdown={ <div>Hello world</div> }>
                <button>Foobar</button>
            </DropdownTrigger>
        );

        component.simulate('click');
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(component.state('shouldShow'))
            .toEqual(false);
    });
});
