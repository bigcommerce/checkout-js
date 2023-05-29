import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';

import DropdownTrigger from './DropdownTrigger';

describe('DropdownTrigger', () => {
    it('shows dropdown when mouse clicks', () => {
        render(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        fireEvent.click(screen.getByText('Foobar'));

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('hides dropdown when mouse clicks again', () => {
        render(
            <DropdownTrigger dropdown={<div>Hello world</div>}>
                <button>Foobar</button>
            </DropdownTrigger>,
        );

        fireEvent.click(screen.getByText('Foobar'));
        fireEvent.click(screen.getByText('Foobar'));

        expect(() => screen.getByText('Hello world')).toThrow();
    });

    it('hides dropdown when mouse clicks anywhere else in document', () => {
        render(
            <div data-testid="root-node-id" id={CHECKOUT_ROOT_NODE_ID}>
                <DropdownTrigger dropdown={<div>Hello world</div>}>
                    <button>Foobar</button>
                </DropdownTrigger>
            </div>,
        );

        fireEvent.click(screen.getByText('Foobar'));

        fireEvent.click(screen.getByTestId('root-node-id'));

        expect(() => screen.getByText('Hello world')).toThrow();
    });
});
