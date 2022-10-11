import { mount } from 'enzyme';
import React from 'react';

import TextInputIframeContainer from './TextInputIframeContainer';

describe('TextInputIframeContainer', () => {
    it('renders container with default input CSS classes', () => {
        const component = mount(<TextInputIframeContainer />);

        expect(component.childAt(0).hasClass('form-input')).toBe(true);
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input')).toBe(true);
    });

    it('renders container with additional CSS classes', () => {
        const component = mount(<TextInputIframeContainer additionalClassName="has-icon" />);

        expect(component.childAt(0).hasClass('form-input')).toBe(true);
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input')).toBe(true);
        expect(component.childAt(0).hasClass('has-icon')).toBe(true);
    });

    it('renders container with focus styles', () => {
        const component = mount(<TextInputIframeContainer appearFocused />);

        expect(component.childAt(0).hasClass('form-input--focus')).toBe(true);
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input--focus')).toBe(true);
    });

    it('does not render container with focus styles unless specified', () => {
        const component = mount(<TextInputIframeContainer appearFocused={false} />);

        expect(component.childAt(0).hasClass('form-input--focus')).toBe(false);
        expect(component.childAt(0).hasClass('optimizedCheckout-form-input--focus')).toBe(false);
    });
});
