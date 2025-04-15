import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ChecklistItemInput from './ChecklistItemInput';

describe('ChecklistItemInput', () => {
    it('renders children inside label', () => {
        render(
            <ChecklistItemInput
                isSelected={false}
                name="foobar"
                onChange={jest.fn()}
                value="foobar_val"
            >
                children text
            </ChecklistItemInput>,
        );

        expect(screen.getByText('children text')).toBeInTheDocument();
    });

    it('renders input as checked when is selected', () => {
        render(
            <ChecklistItemInput
                isSelected={true}
                name="foobar"
                onChange={jest.fn()}
                value="foobar_val"
            />,
        );

        expect(screen.getByRole('radio')).toBeChecked();
    });

    it('renders input as unchecked when is not selected', () => {
        render(
            <ChecklistItemInput
                isSelected={false}
                name="foobar"
                onChange={jest.fn()}
                value="foobar_val"
            />,
        );

        expect(screen.getByRole('radio')).not.toBeChecked();
    });

    it('calls onChange when input changes', async () => {
        const onChange = jest.fn();

        render(
            <ChecklistItemInput
                isSelected={false}
                name="foobar"
                onChange={onChange}
                value="foobar_val"
            />,
        );

        expect(screen.getByRole('radio')).not.toBeChecked();

        await userEvent.click(screen.getByRole('radio'));

        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
