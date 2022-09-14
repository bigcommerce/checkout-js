import { shallow } from 'enzyme';
import React from 'react';

import Legend from './Legend';

describe('Legend', () => {
    it('matches snapshot', () => {
        expect(shallow(<Legend>Hello world</Legend>)).toMatchSnapshot();
    });

    it('renders component with text', () => {
        expect(shallow(<Legend>Hello world</Legend>).text()).toBe('Hello world');
    });

    it('renders component with test ID', () => {
        expect(shallow(<Legend testId="test">Hello world</Legend>).prop('data-test')).toBe('test');
    });

    it('renders component as hidden', () => {
        expect(shallow(<Legend hidden>Hello world</Legend>).hasClass('is-srOnly')).toBe(true);
    });

    it('renders component as heading by default', () => {
        expect(
            shallow(<Legend>Hello world</Legend>).hasClass('optimizedCheckout-headingSecondary'),
        ).toBe(true);
    });
});
