import { mount, ReactWrapper } from 'enzyme';
import React, { Fragment } from 'react';

import Toggle from './Toggle';

describe('Toggle', () => {
    let component: ReactWrapper;

    beforeEach(() => {
        component = mount(
            <Toggle openByDefault={ true }>
                { ({ isOpen, toggle }) => (
                    <Fragment>
                        { isOpen && <span>foo</span> }
                        <a onClick={ toggle }>bar</a>
                    </Fragment>
                ) }
            </Toggle>
        );
    });

    it('renders the content when isOpen is truthy', () => {
        expect(component.find('span').length)
            .toEqual(1);
    });

    it('toggles the content when the trigger is clicked', () => {
        component.find('a').simulate('click');

        expect(component.find('span').length)
            .toEqual(0);

        component.find('a').simulate('click');

        expect(component.find('span').length)
            .toEqual(1);
    });
});
