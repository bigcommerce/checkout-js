import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Modal, { type ModalProps } from './Modal';
import ModalHeader from './ModalHeader';

describe('Modal', () => {
    let defaultProps: ModalProps;

    beforeEach(() => {
        defaultProps = {
            children: <div>Modal content</div>,
            isOpen: true,
            onRequestClose: jest.fn(),
        };
    });

    it('renders modal window if it is open', () => {
        render(<Modal {...defaultProps} />);

        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal window if it is not open', () => {
        render(<Modal {...defaultProps} isOpen={false} />);

        expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('notifies parent component when user clicks on close button', async () => {
        render(<Modal {...defaultProps} shouldShowCloseButton={true} />);

        await userEvent.click(screen.getByText('Close'));

        expect(defaultProps.onRequestClose).toHaveBeenCalled();
    });

    it('renders modal with header if it is provided', () => {
        render(<Modal {...defaultProps} header={<ModalHeader>Footer</ModalHeader>} />);

        expect(screen.getByTestId('modal-heading')).toHaveTextContent('Footer');
    });

    it('renders modal with footer if it is provided', () => {
        render(<Modal {...defaultProps} footer="Footer" />);

        expect(screen.getByTestId('modal-footer')).toHaveTextContent('Footer');
    });
});
