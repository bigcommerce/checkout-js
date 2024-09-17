import { mount } from 'enzyme';
import React from 'react';

import { MultiLineText } from './';

describe('MultiLineText', () => {
    it('should render MultiLineText', () => {
        const text = 'Lorem ipsum';

        const component = mount(<MultiLineText>{text}</MultiLineText>);

        expect(component.text()).toBe(text);
    });
})
