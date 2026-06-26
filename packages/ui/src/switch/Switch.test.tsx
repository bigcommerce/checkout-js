import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { Switch } from './Switch';

describe('Switch', () => {
    it('renders an input with role="switch"', () => {
        render(<Switch checked={false} label="Toggle" />);

        expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('reflects checked state on the input', () => {
        const { rerender } = render(<Switch checked={false} label="Toggle" />);

        expect(screen.getByRole('switch')).not.toBeChecked();

        rerender(<Switch checked={true} label="Toggle" />);

        expect(screen.getByRole('switch')).toBeChecked();
    });

    it('renders the label text', () => {
        render(<Switch checked={false} label="Backorder details" />);

        expect(screen.getByText('Backorder details')).toBeInTheDocument();
    });

    it('associates the label with the input via htmlFor/id', () => {
        render(<Switch checked={false} label="Backorder details" />);

        expect(screen.getByLabelText('Backorder details')).toBeInTheDocument();
    });

    it('forwards the id prop to the input', () => {
        render(<Switch checked={false} id="my-toggle" label="Toggle" />);

        expect(screen.getByRole('switch')).toHaveAttribute('id', 'my-toggle');
    });

    it('forwards the name prop to the input', () => {
        render(<Switch checked={false} label="Toggle" name="my-toggle-name" />);

        expect(screen.getByRole('switch')).toHaveAttribute('name', 'my-toggle-name');
    });

    it('sets data-test attribute via testId prop', () => {
        render(<Switch checked={false} label="Toggle" testId="my-toggle-test" />);

        expect(screen.getByTestId('my-toggle-test')).toBeInTheDocument();
    });

    it('calls onChange with the new checked value', async () => {
        const onChange = jest.fn();

        render(<Switch checked={false} label="Toggle" onChange={onChange} />);

        await userEvent.click(screen.getByRole('switch'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('does not throw when onChange is not provided', async () => {
        render(<Switch checked={false} label="Toggle" />);

        await expect(userEvent.click(screen.getByRole('switch'))).resolves.not.toThrow();
    });

    it('renders label as a React node', () => {
        render(<Switch checked={false} label={<span>Rich label</span>} />);

        expect(screen.getByText('Rich label')).toBeInTheDocument();
    });
});
