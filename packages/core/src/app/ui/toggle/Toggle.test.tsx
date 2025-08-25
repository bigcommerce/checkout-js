import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Toggle, { type ToggleProps } from './Toggle';

describe('Toggle', () => {
    let ToggleTest: FunctionComponent<ToggleProps>;

    beforeEach(() => {
        ToggleTest = () => (
            <Toggle openByDefault={true}>
                {({ isOpen, toggle }) => (
                    <>
                        {isOpen && <span>foo</span>}
                        <a onClick={toggle}>bar</a>
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
