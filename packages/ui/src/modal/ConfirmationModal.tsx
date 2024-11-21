import React, { ReactNode } from 'react';

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
    actionButtonLabel?: string | ReactNode;
}

const ConfirmationModal = ({
    headerId,
    messageId,
    isModalOpen,
    action,
    actionButtonLabel,
    onRequestClose,
}: ConfirmationModalProps) => {
    return (
        <Modal
            additionalModalClassName="modal--confirm"
            footer={
                <Button onClick={action} size={ButtonSize.Small} variant={ButtonVariant.Primary}>
                    {actionButtonLabel ?? <TranslatedString id="common.confirm_action" />}
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
