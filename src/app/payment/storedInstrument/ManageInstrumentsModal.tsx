import { CardInstrument, CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { EMPTY_ARRAY } from '../../common/utility';
import { TranslatedString } from '../../locale';
import { Button, ButtonSize, ButtonVariant } from '../../ui/button';
import { Modal, ModalHeader } from '../../ui/modal';

import isCardInstrument from './isCardInstrument';
import ManageInstrumentsAlert from './ManageInstrumentsAlert';
import ManageInstrumentsTable from './ManageInstrumentsTable';

export interface ManageInstrumentsModalProps {
    isOpen: boolean;
    methodId: string;
    onAfterOpen?(): void;
    onDeleteInstrumentError?(error: Error): void;
    onRequestClose?(): void;
}

export interface ManageInstrumentsModalState {
    isConfirmingDelete: boolean;
    selectedInstrumentId?: string;
}

interface WithCheckoutProps {
    deleteInstrumentError?: Error;
    instruments: CardInstrument[];
    isDeletingInstrument: boolean;
    clearError(error: Error): Promise<CheckoutSelectors>;
    deleteInstrument(id: string): Promise<CheckoutSelectors>;
}

class ManageInstrumentsModal extends Component<ManageInstrumentsModalProps & WithCheckoutProps, ManageInstrumentsModalState> {
    state: ManageInstrumentsModalState = {
        isConfirmingDelete: false,
    };

    render(): ReactNode {
        const {
            deleteInstrumentError,
            isOpen,
            onRequestClose,
        } = this.props;

        return (
            <Modal
                closeButtonLabel={ <TranslatedString id="common.close_action" /> }
                footer={ this.renderFooter() }
                header={
                    <ModalHeader>
                        <TranslatedString id="payment.instrument_manage_modal_title_text" />
                    </ModalHeader>
                }
                isOpen={ isOpen }
                onAfterOpen={ this.handleAfterOpen }
                onRequestClose={ onRequestClose }
            >
                { deleteInstrumentError && <ManageInstrumentsAlert error={ deleteInstrumentError } /> }

                { this.renderContent() }
            </Modal>
        );
    }

    private renderContent(): ReactNode {
        const {
            instruments,
            isDeletingInstrument,
        } = this.props;

        const { isConfirmingDelete } = this.state;

        if (isConfirmingDelete) {
            return (
                <p><TranslatedString id="payment.instrument_manage_modal_confirmation_label" /></p>
            );
        }

        return (
            <ManageInstrumentsTable
                instruments={ instruments }
                isDeletingInstrument={ isDeletingInstrument }
                onDeleteInstrument={ this.handleDeleteInstrument }
            />
        );
    }

    private renderFooter(): ReactNode {
        const { isDeletingInstrument, onRequestClose } = this.props;
        const { isConfirmingDelete } = this.state;

        if (isConfirmingDelete) {
            return (
                <Fragment>
                    <Button
                        data-test="manage-instrument-cancel-button"
                        onClick={ this.handleCancel }
                        size={ ButtonSize.Small }
                    >
                        <TranslatedString id="common.cancel_action" />
                    </Button>

                    <Button
                        data-test="manage-instrument-confirm-button"
                        disabled={ isDeletingInstrument }
                        onClick={ this.handleConfirmDelete }
                        size={ ButtonSize.Small }
                        variant={ ButtonVariant.Primary }
                    >
                        <TranslatedString id="payment.instrument_manage_modal_confirmation_action" />
                    </Button>
                </Fragment>
            );
        }

        return (
            <Button
                data-test="manage-instrument-close-button"
                onClick={ onRequestClose }
                size={ ButtonSize.Small }
            >
                <TranslatedString id="common.close_action" />
            </Button>
        );
    }

    private handleAfterOpen: () => void = () => {
        const { onAfterOpen } = this.props;

        this.setState({
            isConfirmingDelete: false,
        }, onAfterOpen);
    };

    private handleCancel: () => void = () => {
        const {
            clearError,
            deleteInstrumentError,
        } = this.props;

        if (deleteInstrumentError) {
            clearError(deleteInstrumentError);
        }

        this.setState({
            isConfirmingDelete: false,
        });
    };

    private handleConfirmDelete: () => void = async () => {
        const { deleteInstrument, onDeleteInstrumentError = noop, onRequestClose = noop } = this.props;
        const { selectedInstrumentId } = this.state;

        if (!selectedInstrumentId) {
            return;
        }

        try {
            await deleteInstrument(selectedInstrumentId);
            onRequestClose();
        } catch (error) {
            onDeleteInstrumentError(error);
        }
    };

    private handleDeleteInstrument: (id: string) => void = id => {
        this.setState({
            isConfirmingDelete: true,
            selectedInstrumentId: id,
        });
    };
}

export function mapFromCheckoutProps(
    { checkoutService, checkoutState }: CheckoutContextProps,
    { methodId }: ManageInstrumentsModalProps
): WithCheckoutProps | null {
    const {
        data: { getInstruments },
        errors: { getDeleteInstrumentError },
        statuses: { isDeletingInstrument },
    } = checkoutState;

    return {
        clearError: checkoutService.clearError,
        deleteInstrument: checkoutService.deleteInstrument,
        deleteInstrumentError: getDeleteInstrumentError(),
        instruments: (getInstruments() || EMPTY_ARRAY).filter(isCardInstrument).filter(({ provider }) => provider === methodId),
        isDeletingInstrument: isDeletingInstrument(),
    };
}

export default withCheckout(mapFromCheckoutProps)(ManageInstrumentsModal);
