import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Input from './Input';

describe('Input', () => {
    it('matches snapshot', () => {
        render(<Input name="foobar" testId="test" />);

        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('name', 'foobar');
    });

    it('listens to DOM events', async () => {
        const handleChange = jest.fn();

        render(<Input name="foobar" onChange={handleChange} />);

        await userEvent.type(screen.getByRole('textbox'), 'test');

        expect(handleChange).toHaveBeenCalled();
    });
});
