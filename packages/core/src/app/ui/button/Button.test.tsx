import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Button, { ButtonSize, ButtonVariant } from './Button';

describe('Button', () => {
    it('renders button with label', () => {
        render(<Button>Hello world</Button>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders button in various sizes', () => {
        const { container: largeButtonContainer } = render(<Button size={ButtonSize.Large}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(largeButtonContainer.firstChild).toHaveClass('button--large');

        const { container: smallButtonContainer } = render(<Button size={ButtonSize.Small}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(smallButtonContainer.firstChild).toHaveClass('button--small');

        const { container: tinyButtonContainer } = render(<Button size={ButtonSize.Tiny}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(tinyButtonContainer.firstChild).toHaveClass('button--tiny');
    });

    it('renders button in various styles', () => {
        const { container: primaryButtonContainer } = render(<Button variant={ButtonVariant.Primary}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(primaryButtonContainer.firstChild).toHaveClass('button--primary');

        const { container: secondaryButtonContainer } = render(<Button variant={ButtonVariant.Secondary}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(secondaryButtonContainer.firstChild).toHaveClass('button--tertiary');

        const { container: actionButtonContainer } = render(<Button variant={ButtonVariant.Action}>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(actionButtonContainer.firstChild).toHaveClass('button--action');
    });

    it('renders button in full width', () => {
        const { container: fullWidthButtonContainer } = render(<Button isFullWidth>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(fullWidthButtonContainer.firstChild).toHaveClass('button--slab');

        const { container: defaultButtonContainer } = render(<Button>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(defaultButtonContainer.firstChild).not.toHaveClass('button--slab');
    });

    it('shows loading indicator', () => {
        const { container } = render(<Button isLoading>Hello world</Button>);

        // eslint-disable-next-line testing-library/no-node-access
        expect(container.firstChild).toHaveClass('is-loading');
    });

    it('listens to DOM events', async () => {
        const handleClick = jest.fn();

        render(<Button onClick={handleClick}>Hello world</Button>);

        await userEvent.click(screen.getByText('Hello world'));

        expect(handleClick).toHaveBeenCalled();
    });
});
