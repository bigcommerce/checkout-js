import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Button, ButtonSize, ButtonVariant } from '../button';

import Modal from './Modal';
import ModalHeader from './ModalHeader';

interface ConfirmationModalProps {
    headerId: string;
    messageId: string;
    isModalOpen: boolean;
    onRequestClose: () => void;
    action: () => void;
}

const ConfirmationModal = ({
    headerId,
    messageId,
    isModalOpen,
    action,
    onRequestClose,
}: ConfirmationModalProps) => {
    return (
        <Modal
            additionalModalClassName="modal--confirm"
            footer={
                <Button
                    onClick={action}
                    size={ButtonSize.Small}
                    testId="edit-multi-shipping-cart-confirm-button"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="common.confirm_action" />
                </Button>
            }
            header={
                <ModalHeader>
                    <span aria-live="assertive" role="alert">
                        <TranslatedString id={headerId} />
                    </span>
                </ModalHeader>
            }
            isOpen={isModalOpen}
            onRequestClose={onRequestClose}
            shouldShowCloseButton={true}
        >
            <p aria-live="assertive" role="alert">
                <TranslatedString id={messageId} />
            </p>
        </Modal>
    );
};

export default ConfirmationModal;
