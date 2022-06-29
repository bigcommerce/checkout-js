import { shallow } from 'enzyme';
import React from 'react';

import Label from './Label';

describe('Label', () => {
    it('matches snapshot', () => {
        expect(shallow(<Label>Hello world</Label>))
            .toMatchSnapshot();
    });

    it('renders component with text', () => {
        expect(shallow(<Label>Hello world</Label>).text())
            .toEqual('Hello world');
    });

    it('renders component with test ID', () => {
        expect(shallow(<Label testId="test">Hello world</Label>).prop('data-test'))
            .toEqual('test');
    });
});
