/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutStepHeader, { type CheckoutStepHeaderProps } from './CheckoutStepHeader';
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
        render(<CheckoutStepHeader {...defaultProps} isComplete />);

        expect(screen.getByTestId('step-info')).toHaveTextContent('Billing summary');
    });

    it('does not render summary if it is active', () => {
        render(<CheckoutStepHeader {...defaultProps} isActive />);

        expect(screen.getByTestId('step-info')).toBeEmptyDOMElement();
    });

    it('does not render summary if it is inactive or incomplete', () => {
        render(<CheckoutStepHeader {...defaultProps} />);

        expect(screen.getByTestId('step-info')).toBeEmptyDOMElement();
    });

    it('renders edit button if it is editable', () => {
        const { container } = render(<CheckoutStepHeader {...defaultProps} isEditable />);

        expect(screen.getByTestId('step-edit-button')).toBeInTheDocument();
        expect(container.querySelector('.is-readonly')).not.toBeInTheDocument();
        expect(container.querySelector('.is-clickable')).toBeInTheDocument();
    });

    it('does not render edit button if it is not editable', () => {
        const { container } = render(<CheckoutStepHeader {...defaultProps} />);

        expect(screen.queryByTestId('step-edit-button')).not.toBeInTheDocument();
        expect(container.querySelector('.is-readonly')).toBeInTheDocument();
        expect(container.querySelector('.is-clickable')).not.toBeInTheDocument();
    });

    it('triggers callback when clicked', async () => {
        const handleEdit = jest.fn();

        render(<CheckoutStepHeader {...defaultProps} isEditable onEdit={handleEdit}/>);

        await userEvent.click(screen.getByRole('heading'));

        expect(handleEdit).toHaveBeenCalledWith(defaultProps.type);
    });

    it('does not trigger callback when clicked if step is not editable', async () => {
        const handleEdit = jest.fn();

        render(<CheckoutStepHeader {...defaultProps} onEdit={handleEdit}/>);

        await userEvent.click(screen.getByRole('heading'));

        expect(handleEdit).not.toHaveBeenCalled();
    });

    it('renders "complete" icon if step is complete', () => {
        const { container } = render(<CheckoutStepHeader {...defaultProps} isComplete />);

        expect(container.querySelector('.stepHeader-counter--complete')).toBeInTheDocument();
 });

    it('does not render "complete" icon if step is incomplete', () => {
        render(<CheckoutStepHeader {...defaultProps} />);

        expect(screen.queryByTestId('step-complete-icon')).not.toBeInTheDocument();
    });
});
