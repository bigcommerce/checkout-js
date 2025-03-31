import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
    it('renders confirmation modal window if it is open and renders close button by default', async () => {
        const handleClose = jest.fn();

        render(
            <ConfirmationModal
                action={jest.fn()}
                headerId="cart.edit_cart_action"
                isModalOpen={true}
                messageId="cart.edit_multi_shipping_cart_message"
                onRequestClose={handleClose}
            />,
        );

        expect(screen.getByText('Edit Cart')).toBeInTheDocument();
        expect(
            screen.getByText(
                'New items will default to Shipping Destination #1. Reallocate if you want them shipped to other destinations.',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Close'));
        expect(handleClose).toHaveBeenCalled();
    });

    it('does not render confirmation modal window if it is not open', () => {
        render(
            <ConfirmationModal
                action={jest.fn()}
                headerId="cart.edit_cart_action"
                isModalOpen={false}
                messageId="cart.edit_multi_shipping_cart_message"
            />,
        );

        expect(screen.queryByText('Edit cart')).not.toBeInTheDocument();
    });

    it('renders action button label text if passed', () => {
        render(
            <ConfirmationModal
                action={jest.fn()}
                actionButtonLabel="Custom Action"
                headerId="cart.edit_cart_action"
                isModalOpen={true}
                messageId="cart.edit_multi_shipping_cart_message"
            />,
        );

        expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('does not render close button if flag is false', () => {
        render(
            <ConfirmationModal
                action={jest.fn()}
                headerId="cart.edit_cart_action"
                isModalOpen={true}
                messageId="cart.edit_multi_shipping_cart_message"
                shouldShowCloseButton={false}
            />,
        );

        expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
});
