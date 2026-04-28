import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Button, { ButtonSize, ButtonVariant } from './Button';

describe('Button', () => {
    it('renders button with label', () => {
        render(<Button>Hello world</Button>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders large size button correctly', () => {
        render(<Button size={ButtonSize.Large}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--large');
    });

    it('renders small size button correctly', () => {
        render(<Button size={ButtonSize.Small}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--small');
    });

    it('renders tiny size button correctly', () => {
        render(<Button size={ButtonSize.Tiny}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--tiny');
    });

    it('renders primary button style correctly', () => {
        render(<Button variant={ButtonVariant.Primary}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--primary');
    });

    it('renders secondary button style correctly', () => {
        render(<Button variant={ButtonVariant.Secondary}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--tertiary');
    });

    it('renders action button style correctly', () => {
        render(<Button variant={ButtonVariant.Action}>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--action');
    });

    it('renders button in full width correctly', () => {
        render(<Button isFullWidth>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('button--slab');
    });

    it('does not apply full width to buttons by default', () => {
        render(<Button>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).not.toHaveClass('button--slab');
    });

    it('shows loading indicator', () => {
        render(<Button isLoading>Hello world</Button>);

        expect(screen.getByRole('button', { name: 'Hello world' })).toHaveClass('is-loading');
    });

    it('listens to DOM events', async () => {
        const handleClick = jest.fn();

        render(<Button onClick={handleClick}>Hello world</Button>);

        await userEvent.click(screen.getByText('Hello world'));

        expect(handleClick).toHaveBeenCalled();
    });
});
