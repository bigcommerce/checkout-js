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

    describe('when given an ariaLabel', () => {
        const renderTrigger = () =>
            render(
                <TooltipTrigger ariaLabel="Show help" tooltip={<div>Hello world</div>}>
                    <span>Foobar</span>
                </TooltipTrigger>,
            );

        it('renders the trigger as a named button', () => {
            renderTrigger();

            expect(screen.getByRole('button', { name: 'Show help' })).toBeInTheDocument();
        });

        it('shows the tooltip when the trigger receives keyboard focus', async () => {
            renderTrigger();

            await userEvent.tab();

            expect(screen.getByRole('button', { name: 'Show help' })).toHaveFocus();
            expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        it('describes the trigger with the tooltip while it is visible', async () => {
            renderTrigger();

            await userEvent.tab();

            const trigger = screen.getByRole('button', { name: 'Show help' });

            expect(trigger).toHaveAttribute('aria-describedby', screen.getByRole('tooltip').id);
            expect(trigger).toHaveAccessibleDescription('Hello world');
        });

        it('leaves aria-describedby off while the tooltip is hidden', () => {
            renderTrigger();

            expect(screen.getByRole('button', { name: 'Show help' })).not.toHaveAttribute(
                'aria-describedby',
            );
        });

        it('stays open while the pointer is over the tooltip', async () => {
            renderTrigger();

            await userEvent.hover(screen.getByRole('button', { name: 'Show help' }));
            await userEvent.hover(screen.getByRole('tooltip'));

            expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        it('stays open when the tooltip content is clicked', async () => {
            renderTrigger();

            await userEvent.click(screen.getByRole('button', { name: 'Show help' }));
            await userEvent.hover(screen.getByRole('tooltip'));
            await userEvent.click(screen.getByText('Hello world'));

            expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        it('hides the tooltip once the pointer leaves it', async () => {
            renderTrigger();

            await userEvent.click(screen.getByRole('button', { name: 'Show help' }));
            await userEvent.hover(screen.getByRole('tooltip'));
            await userEvent.unhover(screen.getByRole('tooltip'));

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        it('still dismisses on blur after Escape closed it while the pointer was over it', async () => {
            renderTrigger();

            await userEvent.click(screen.getByRole('button', { name: 'Show help' }));
            await userEvent.hover(screen.getByRole('tooltip'));
            await userEvent.keyboard('{Escape}');

            await userEvent.click(screen.getByRole('button', { name: 'Show help' }));
            await userEvent.tab();

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        it('dismisses the tooltip on Escape without moving focus', async () => {
            renderTrigger();

            await userEvent.tab();
            await userEvent.keyboard('{Escape}');

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Show help' })).toHaveFocus();
        });
    });

    describe('when not given an ariaLabel', () => {
        it('leaves the trigger as a non-focusable span', () => {
            render(
                <TooltipTrigger tooltip={<div>Hello world</div>}>
                    <span>Foobar</span>
                </TooltipTrigger>,
            );

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });
});
