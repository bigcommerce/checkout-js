import { type PaymentInstrument } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { type ReactElement, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { Button, ButtonSize, ButtonVariant, Modal, ModalHeader } from '@bigcommerce/checkout/ui';

import {
    isAccountInstrument,
    isAchInstrument,
    isBankAccountInstrument,
    isCardInstrument,
} from '../../guards';
import { ManageAccountInstrumentsTable } from '../ManageAccountInstrumentsTable';
import { ManageAchInstrumentsTable } from '../ManageAchInstrumentsTable';
import { ManageCardInstrumentsTable } from '../ManageCardInstrumentsTable';
import { ManageInstrumentsAlert } from '../ManageInstrumentsAlert';

export interface ManageInstrumentsModalProps {
    isOpen: boolean;
    instruments: PaymentInstrument[];
    onAfterOpen?(): void;
    onDeleteInstrument?(instrumentId: string): void;
    onDeleteInstrumentError?(error: Error): void;
    onRequestClose?(): void;
}

const ManageInstrumentsModal = ({
    isOpen,
    instruments,
    onAfterOpen,
    onDeleteInstrument = noop,
    onDeleteInstrumentError = noop,
    onRequestClose,
}: ManageInstrumentsModalProps): ReactElement => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>();

    const {
        checkoutState: {
            errors: { getDeleteInstrumentError },
            statuses: { isDeletingInstrument, isLoadingInstruments },
        },
        checkoutService: { deleteInstrument, clearError },
    } = useCheckout();

    const deleteInstrumentError = getDeleteInstrumentError();

    const handleAfterOpen = (): void => {
        setIsConfirmingDelete(false);
        onAfterOpen?.();
    };

    const handleCancel = (): void => {
        const existingError = getDeleteInstrumentError();

        if (existingError) {
            void clearError(existingError);
        }

        setIsConfirmingDelete(false);
    };

    const handleConfirmDelete = async (): Promise<void> => {
        if (!selectedInstrumentId) {
            return;
        }

        try {
            await deleteInstrument(selectedInstrumentId);
            onDeleteInstrument(selectedInstrumentId);
            onRequestClose?.();
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));

            onDeleteInstrumentError(err);
        }
    };

    const handleDeleteInstrument = (id: string): void => {
        setIsConfirmingDelete(true);
        setSelectedInstrumentId(id);
    };

    const ModalContent = () => {
        if (isConfirmingDelete) {
            return (
                <p>
                    <TranslatedString id="payment.instrument_manage_modal_confirmation_label" />
                </p>
            );
        }

        const cardInstruments = instruments.filter(isCardInstrument);
        const bankInstruments = instruments.filter(isBankAccountInstrument);
        const accountInstruments = instruments.filter(isAccountInstrument);
        const achInstrument = instruments.filter(isAchInstrument);

        if (achInstrument.length) {
            return (
                <ManageAchInstrumentsTable
                    instruments={achInstrument}
                    isDeletingInstrument={isDeletingInstrument()}
                    onDeleteInstrument={handleDeleteInstrument}
                />
            );
        }

        const bankAndAccountInstruments = [...bankInstruments, ...accountInstruments];

        if (bankAndAccountInstruments.length) {
            return (
                <ManageAccountInstrumentsTable
                    instruments={bankAndAccountInstruments}
                    isDeletingInstrument={isDeletingInstrument()}
                    onDeleteInstrument={handleDeleteInstrument}
                />
            );
        }

        return (
            <ManageCardInstrumentsTable
                instruments={cardInstruments}
                isDeletingInstrument={isDeletingInstrument()}
                onDeleteInstrument={handleDeleteInstrument}
            />
        );
    };

    const ConfirmDelete = () => (
        <>
            <Button
                onClick={handleCancel}
                size={ButtonSize.Small}
                testId="manage-instrument-cancel-button"
            >
                <TranslatedString id="common.cancel_action" />
            </Button>

            <Button
                disabled={isDeletingInstrument() || isLoadingInstruments()}
                onClick={handleConfirmDelete}
                size={ButtonSize.Small}
                testId="manage-instrument-confirm-button"
                variant={ButtonVariant.Primary}
            >
                <TranslatedString id="payment.instrument_manage_modal_confirmation_action" />
            </Button>
        </>
    );
    const CloseButton = () => (
        <Button
            onClick={onRequestClose}
            size={ButtonSize.Small}
            testId="manage-instrument-close-button"
        >
            <TranslatedString id="common.close_action" />
        </Button>
    );

    return (
        <Modal
            closeButtonLabel={<TranslatedString id="common.close_action" />}
            footer={isConfirmingDelete ? <ConfirmDelete /> : <CloseButton />}
            header={
                <ModalHeader>
                    <TranslatedString id="payment.instrument_manage_modal_title_text" />
                </ModalHeader>
            }
            isOpen={isOpen}
            onAfterOpen={handleAfterOpen}
            onRequestClose={onRequestClose}
        >
            {deleteInstrumentError && <ManageInstrumentsAlert error={deleteInstrumentError} />}

            <ModalContent />
        </Modal>
    );
};

export default ManageInstrumentsModal;
