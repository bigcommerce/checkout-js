import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent, type PropsWithChildren } from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { Toggle } from './Toggle';

describe('Toggle', () => {
    let ToggleTest: FunctionComponent<PropsWithChildren>;

    beforeEach(() => {
        ToggleTest = () => (
            <Toggle openByDefault={true}>
                {({ isOpen, toggle }) => (
                    <>
                        {isOpen && <span>foo</span>}
                        <a href="#" onClick={toggle}>
                            bar
                        </a>
                    </>
                )}
            </Toggle>
        );
    });

    it('renders the content when isOpen is truthy', () => {
        render(<ToggleTest />);

        expect(screen.getByText('foo')).toBeInTheDocument();
        expect(screen.getByText('bar')).toBeInTheDocument();
    });

    it('toggles the content when the trigger is clicked', async () => {
        render(<ToggleTest />);

        await userEvent.click(screen.getByText('bar'));

        expect(screen.queryByText('foo')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText('bar'));

        expect(screen.getByText('foo')).toBeInTheDocument();
    });
});
