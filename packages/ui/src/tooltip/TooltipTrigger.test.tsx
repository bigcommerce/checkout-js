import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import TooltipTrigger from './TooltipTrigger';

describe('TooltipTrigger', () => {
    it('shows tooltip when mouse enters', async () => {
        render(
            <TooltipTrigger tooltip={<div>Hello world</div>}>
                <button>Foobar</button>
            </TooltipTrigger>,
        );

        await userEvent.hover(screen.getByText('Foobar'));

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('hides tooltip when mouse leaves', async () => {
        render(
            <TooltipTrigger tooltip={<div>Hello world</div>}>
                <button>Foobar</button>
            </TooltipTrigger>,
        );

        await userEvent.hover(screen.getByText('Foobar'));
        await userEvent.unhover(screen.getByText('Foobar'));

        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });
});
