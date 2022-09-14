import { shallow } from 'enzyme';
import React from 'react';

import { Button } from '../ui/button';
import { IconCheck } from '../ui/icon';

import CheckoutStepHeader, { CheckoutStepHeaderProps } from './CheckoutStepHeader';
import CheckoutStepType from './CheckoutStepType';

describe('CheckoutStepHeader', () => {
    let defaultProps: CheckoutStepHeaderProps;

    beforeEach(() => {
        defaultProps = {
            heading: 'Billing',
            summary: 'Billing summary',
            type: CheckoutStepType.Billing,
        };
    });

    it('renders summary if it is inactive and complete', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} isComplete />);

        expect(component.find('[data-test="step-info"]').text()).toBe('Billing summary');
    });

    it('does not render summary if it is active', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} isActive />);

        expect(component.find('[data-test="step-info"]').text()).toBe('');
    });

    it('does not render summary if it is inactive or incomplete', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} />);

        expect(component.find('[data-test="step-info"]').text()).toBe('');
    });

    it('renders edit button if it is editable', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} isEditable />);

        expect(component.find(Button).prop('testId')).toBe('step-edit-button');

        expect(component.prop('className')).not.toContain('is-readonly');

        expect(component.prop('className')).toContain('is-clickable');
    });

    it('does not render edit button if it is not editable', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} />);

        expect(component.exists('[data-test="step-edit-button"]')).toBe(false);

        expect(component.prop('className')).toContain('is-readonly');
    });

    it('triggers callback when clicked', () => {
        const handleEdit = jest.fn();
        const event = { preventDefault: jest.fn() };
        const component = shallow(
            <CheckoutStepHeader {...defaultProps} isEditable onEdit={handleEdit} />,
        );

        component.simulate('click', event);

        expect(handleEdit).toHaveBeenCalledWith(defaultProps.type);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does not trigger callback when clicked if step is not editable', () => {
        const handleEdit = jest.fn();
        const event = { preventDefault: jest.fn() };
        const component = shallow(<CheckoutStepHeader {...defaultProps} onEdit={handleEdit} />);

        component.simulate('click', event);

        expect(handleEdit).not.toHaveBeenCalled();

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('renders "complete" icon if step is complete', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} isComplete />);

        expect(component.find(IconCheck).prop('additionalClassName')).toContain(
            'stepHeader-counter--complete',
        );
    });

    it('does not render "complete" icon if step is incomplete', () => {
        const component = shallow(<CheckoutStepHeader {...defaultProps} />);

        expect(component.find(IconCheck).prop('additionalClassName')).not.toContain(
            'stepHeader-counter--complete',
        );
    });
});
