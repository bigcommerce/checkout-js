 
 
 
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import Toggle from './Toggle';

describe('Toggle', () => {
    let component: ReactWrapper;

    beforeEach(() => {
        component = mount(
            <Toggle openByDefault={true}>
                {({ isOpen, toggle }) => (
                    <>
                        {isOpen && <span>foo</span>}
                        <a onClick={toggle}>bar</a>
                    </>
                )}
            </Toggle>,
        );
    });

    it('renders the content when isOpen is truthy', () => {
        expect(component.find('span')).toHaveLength(1);
    });

    it('toggles the content when the trigger is clicked', () => {
        component.find('a').simulate('click');

        expect(component.find('span')).toHaveLength(0);

        component.find('a').simulate('click');

        expect(component.find('span')).toHaveLength(1);
    });
});
