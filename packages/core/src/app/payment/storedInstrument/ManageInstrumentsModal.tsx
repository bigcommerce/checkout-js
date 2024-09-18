import { CheckoutSelectors, PaymentInstrument } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';


import { withCheckout } from '../../checkout';
import { Button, ButtonSize, ButtonVariant } from '../../ui/button';
import { Modal, ModalHeader } from '../../ui/modal';

import isAccountInstrument from './isAccountInstrument';
import isBankAccountInstrument from './isBankAccountInstrument';
import isCardInstrument from './isCardInstrument';
import ManageAccountInstrumentsTable from './ManageAccountInstrumentsTable';
import ManageCardInstrumentsTable from './ManageCardInstrumentsTable';
import ManageInstrumentsAlert from './ManageInstrumentsAlert';

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

interface WithCheckoutProps {
    deleteInstrumentError?: Error;
    isDeletingInstrument: boolean;
    isLoadingInstruments: boolean;
    clearError(error: Error): Promise<CheckoutSelectors>;
    deleteInstrument(id: string): Promise<CheckoutSelectors>;
}

class ManageInstrumentsModal extends Component<
    ManageInstrumentsModalProps & WithCheckoutProps,
    ManageInstrumentsModalState
> {
    state: ManageInstrumentsModalState = {
        isConfirmingDelete: false,
    };

    render(): ReactNode {
        const { deleteInstrumentError, isOpen, onRequestClose } = this.props;

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
        const { instruments, isDeletingInstrument } = this.props;

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

        const bankAndAccountInstruments = [...bankInstruments, ...accountInstruments];

        if (bankAndAccountInstruments.length) {
            return (
                <ManageAccountInstrumentsTable
                    instruments={bankAndAccountInstruments}
                    isDeletingInstrument={isDeletingInstrument}
                    onDeleteInstrument={this.handleDeleteInstrument}
                />
            );
        }

        return (
            <ManageCardInstrumentsTable
                instruments={cardInstruments}
                isDeletingInstrument={isDeletingInstrument}
                onDeleteInstrument={this.handleDeleteInstrument}
            />
        );
    }

    private renderFooter(): ReactNode {
        const { isDeletingInstrument, isLoadingInstruments, onRequestClose } = this.props;
        const { isConfirmingDelete } = this.state;

        if (isConfirmingDelete) {
            return (
                <>
                    <Button
                        data-test="manage-instrument-cancel-button"
                        onClick={this.handleCancel}
                        size={ButtonSize.Small}
                    >
                        <TranslatedString id="common.cancel_action" />
                    </Button>

                    <Button
                        data-test="manage-instrument-confirm-button"
                        disabled={isDeletingInstrument || isLoadingInstruments}
                        onClick={this.handleConfirmDelete}
                        size={ButtonSize.Small}
                        variant={ButtonVariant.Primary}
                    >
                        <TranslatedString id="payment.instrument_manage_modal_confirmation_action" />
                    </Button>
                </>
            );
        }

        return (
            <Button
                data-test="manage-instrument-close-button"
                onClick={onRequestClose}
                size={ButtonSize.Small}
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
        const { clearError, deleteInstrumentError } = this.props;

        if (deleteInstrumentError) {
            clearError(deleteInstrumentError);
        }

        this.setState({
            isConfirmingDelete: false,
        });
    };

    private handleConfirmDelete: () => void = async () => {
        const {
            deleteInstrument,
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

export function mapFromCheckoutProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutProps | null {
    const {
        errors: { getDeleteInstrumentError },
        statuses: { isDeletingInstrument, isLoadingInstruments },
    } = checkoutState;

    return {
        clearError: checkoutService.clearError,
        deleteInstrument: checkoutService.deleteInstrument,
        deleteInstrumentError: getDeleteInstrumentError(),
        isDeletingInstrument: isDeletingInstrument(),
        isLoadingInstruments: isLoadingInstruments(),
    };
}

export default withCheckout(mapFromCheckoutProps)(ManageInstrumentsModal);
