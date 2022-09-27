import { shallow } from 'enzyme';
import React from 'react';

import Fieldset from './Fieldset';

describe('Fieldset', () => {
    it('matches snapshot', () => {
        expect(
            shallow(
                <Fieldset legend={<legend>Hello world</legend>}>
                    <input type="text" />
                </Fieldset>,
            ),
        ).toMatchSnapshot();
    });

    it('renders component with test ID', () => {
        const component = shallow(
            <Fieldset legend={<legend>Hello world</legend>} testId="test">
                Hello world
            </Fieldset>,
        );

        expect(component.prop('data-test')).toBe('test');
    });

    it('renders component with legend', () => {
        const component = shallow(
            <Fieldset legend={<legend>Hello world</legend>}>
                <input type="text" />
            </Fieldset>,
        );

        expect(component.find('legend').text()).toBe('Hello world');
    });

    it('renders component with children', () => {
        const component = shallow(
            <Fieldset legend={<legend>Hello world</legend>}>
                <input type="text" />
            </Fieldset>,
        );

        expect(component.find('.form-body').children().html()).toBe('<input type="text"/>');
    });
});
