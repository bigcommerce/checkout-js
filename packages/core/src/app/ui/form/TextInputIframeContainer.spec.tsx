import { mount } from 'enzyme';
import React from 'react';

import TextInputIframeContainer from './TextInputIframeContainer';

describe('TextInputIframeContainer', () => {
    it('renders container with default input CSS classes', () => {
        const component = mount(<TextInputIframeContainer />);

        expect(component.childAt(0).hasClass('form-input'))
            .toBeTruthy();
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input'))
            .toBeTruthy();
    });

    it('renders container with additional CSS classes', () => {
        const component = mount(<TextInputIframeContainer additionalClassName="has-icon" />);

        expect(component.childAt(0).hasClass('form-input'))
            .toBeTruthy();
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input'))
            .toBeTruthy();
        expect(component.childAt(0).hasClass('has-icon'))
            .toBeTruthy();
    });

    it('renders container with focus styles', () => {
        const component = mount(<TextInputIframeContainer appearFocused />);

        expect(component.childAt(0).hasClass('form-input--focus'))
            .toBeTruthy();
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input--focus'))
            .toBeTruthy();
    });

    it('does not render container with focus styles unless specified', () => {
        const component = mount(<TextInputIframeContainer appearFocused={ false } />);

        expect(component.childAt(0).hasClass('form-input--focus'))
            .toBeFalsy();
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input--focus'))
            .toBeFalsy();
    });
});
