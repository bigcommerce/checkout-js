import { PaymentInstrument } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
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

export interface ManageInstrumentsModalState {
    isConfirmingDelete: boolean;
    selectedInstrumentId?: string;
}

class ManageInstrumentsModal extends Component<
    ManageInstrumentsModalProps,
    ManageInstrumentsModalState
> {
    static contextType = CheckoutContext;
    declare context: React.ContextType<typeof CheckoutContext>;

    state: ManageInstrumentsModalState = {
        isConfirmingDelete: false,
    };

    render(): ReactNode {
        if (!this.context) {
            throw Error('Need to wrap in checkout context');
        }

        const {
            checkoutState: {
                errors: { getDeleteInstrumentError },
            },
        } = this.context;

        const deleteInstrumentError = getDeleteInstrumentError();

        const { isOpen, onRequestClose } = this.props;

        return (
            <Modal
                closeButtonLabel={<TranslatedString id="common.close_action" />}
                footer={this.renderFooter()}
                header={
                    <ModalHeader>
                        <TranslatedString id="payment.instrument_manage_modal_title_text" />
                    </ModalHeader>
                }
                isOpen={isOpen}
                onAfterOpen={this.handleAfterOpen}
                onRequestClose={onRequestClose}
            >
                {deleteInstrumentError && <ManageInstrumentsAlert error={deleteInstrumentError} />}

                {this.renderContent()}
            </Modal>
        );
    }

    private renderContent(): ReactNode {
        if (!this.context) {
            throw Error('Need to wrap in checkout context');
        }

        const {
            checkoutState: {
                statuses: { isDeletingInstrument },
            },
        } = this.context;
        const { instruments } = this.props;

        const { isConfirmingDelete } = this.state;

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
                    onDeleteInstrument={this.handleDeleteInstrument}
                />
            );
        }

        const bankAndAccountInstruments = [...bankInstruments, ...accountInstruments];

        if (bankAndAccountInstruments.length) {
            return (
                <ManageAccountInstrumentsTable
                    instruments={bankAndAccountInstruments}
                    isDeletingInstrument={isDeletingInstrument()}
                    onDeleteInstrument={this.handleDeleteInstrument}
                />
            );
        }

        return (
            <ManageCardInstrumentsTable
                instruments={cardInstruments}
                isDeletingInstrument={isDeletingInstrument()}
                onDeleteInstrument={this.handleDeleteInstrument}
            />
        );
    }

    private renderFooter(): ReactNode {
        if (!this.context) {
            throw Error('Need to wrap in checkout context');
        }

        const {
            checkoutState: {
                statuses: { isDeletingInstrument, isLoadingInstruments },
            },
        } = this.context;

        const { onRequestClose } = this.props;
        const { isConfirmingDelete } = this.state;

        if (isConfirmingDelete) {
            return (
                <>
                    <Button
                        onClick={this.handleCancel}
                        size={ButtonSize.Small}
                        testId="manage-instrument-cancel-button"
                    >
                        <TranslatedString id="common.cancel_action" />
                    </Button>

                    <Button
                        disabled={isDeletingInstrument() || isLoadingInstruments()}
                        onClick={this.handleConfirmDelete}
                        size={ButtonSize.Small}
                        testId="manage-instrument-confirm-button"
                        variant={ButtonVariant.Primary}
                    >
                        <TranslatedString id="payment.instrument_manage_modal_confirmation_action" />
                    </Button>
                </>
            );
        }

        return (
            <Button
                onClick={onRequestClose}
                size={ButtonSize.Small}
                testId="manage-instrument-close-button"
            >
                <TranslatedString id="common.close_action" />
            </Button>
        );
    }

    private handleAfterOpen: () => void = () => {
        const { onAfterOpen } = this.props;

        this.setState(
            {
                isConfirmingDelete: false,
            },
            onAfterOpen,
        );
    };

    private handleCancel: () => void = () => {
        if (!this.context) {
            throw Error('Need to wrap in checkout context');
        }

        const {
            checkoutState: {
                errors: { getDeleteInstrumentError },
            },
            checkoutService: { clearError },
        } = this.context;

        const deleteInstrumentError = getDeleteInstrumentError();

        if (deleteInstrumentError) {
            void clearError(deleteInstrumentError);
        }

        this.setState({
            isConfirmingDelete: false,
        });
    };

    private handleConfirmDelete: () => void = async () => {
        if (!this.context) {
            throw Error('Need to wrap in checkout context');
        }

        const {
            checkoutService: { deleteInstrument },
        } = this.context;

        const {
            onDeleteInstrument = noop,
            onDeleteInstrumentError = noop,
            onRequestClose = noop,
        } = this.props;
        const { selectedInstrumentId } = this.state;

        if (!selectedInstrumentId) {
            return;
        }

        try {
            await deleteInstrument(selectedInstrumentId);
            onDeleteInstrument(selectedInstrumentId);
            onRequestClose();
        } catch (error) {
            onDeleteInstrumentError(error);
        }
    };

    private handleDeleteInstrument: (id: string) => void = (id) => {
        this.setState({
            isConfirmingDelete: true,
            selectedInstrumentId: id,
        });
    };
}

export default ManageInstrumentsModal;
