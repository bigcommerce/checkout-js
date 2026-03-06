import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';

import DropdownTrigger from './DropdownTrigger';

describe('DropdownTrigger', () => {
    it('shows dropdown when mouse clicks', async () => {
        render(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        await userEvent.click(screen.getByText('Foobar'));

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('hides dropdown when mouse clicks again', async () => {
        render(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        await userEvent.click(screen.getByText('Foobar'));
        await userEvent.click(screen.getByText('Foobar'));

        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });

    it('hides dropdown when mouse clicks anywhere else in document', () => {
        render(
            <div data-test="root-node-id" id={CHECKOUT_ROOT_NODE_ID}>
                <DropdownTrigger dropdown={<div>Hello world</div>}>
                    <button>Foobar</button>
                </DropdownTrigger>
            </div>,
        );

        fireEvent.click(screen.getByText('Foobar'));
        fireEvent.click(screen.getByTestId('root-node-id'));

        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });

    it('does not hide dropdown when clicking on an input inside the dropdown menu', () => {
        render(
            <div data-test="root-node-id" id={CHECKOUT_ROOT_NODE_ID}>
                <DropdownTrigger
                    dropdown={
                        <div>
                            Hello world
                            <input aria-label="Input" type="text" />
                        </div>
                    }
                >
                    <button>Foobar</button>
                </DropdownTrigger>
            </div>,
        );

        fireEvent.click(screen.getByText('Foobar'));
        expect(screen.getByText('Hello world')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Input'));
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
});
