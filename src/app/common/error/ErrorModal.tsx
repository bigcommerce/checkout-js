import { noop } from 'lodash';
import React, { Fragment, PureComponent, ReactNode, SyntheticEvent } from 'react';

import { TranslatedString } from '../../locale';
import { Button, ButtonSize } from '../../ui/button';
import { IconError, IconSize } from '../../ui/icon';
import { Modal, ModalHeader } from '../../ui/modal';

import computeErrorCode from './computeErrorCode';
import isCustomError from './isCustomError';
import ErrorCode from './ErrorCode';

export interface ErrorModalProps {
    error?: Error;
    message?: ReactNode;
    title?: ReactNode;
    shouldShowErrorCode?: boolean;
    onClose?(event: Event, props: ErrorModalOnCloseProps): void;
}

export interface ErrorModalOnCloseProps {
    error: Error;
}

export default class ErrorModal extends PureComponent<ErrorModalProps> {
    render(): ReactNode {
        const { error } = this.props;

        return (
            <Modal
                isOpen={ !!error }
                additionalModalClassName="modal--error"
                onRequestClose={ this.handleOnRequestClose }
                header={ this.renderHeader() }
                footer={ this.renderFooter() }
            >
                { this.renderBody() }
            </Modal>
        );
    }

    private renderHeader(): ReactNode {
        const {
            error,
            title = error && isCustomError(error) && error.title,
        } = this.props;

        return (
            <ModalHeader>
                <IconError additionalClassName="icon--error modal-header-icon" size={ IconSize.Small } />
                { title || <TranslatedString id="common.error_heading" /> }
            </ModalHeader>
        );
    }

    private renderBody(): ReactNode {
        const {
            error,
            message = error && error.message,
        } = this.props;

        return (
            <Fragment>
                { message && <p>{ message }</p> }

                <div className="optimizedCheckout-contentSecondary">
                    { this.renderErrorCode() }
                </div>
            </Fragment>
        );
    }

    private renderFooter(): ReactNode {
        return (
            <Button
                onClick={ this.handleOnRequestClose }
                size={ ButtonSize.Small }
            >
                <TranslatedString id="common.ok_action" />
            </Button>
        );
    }

    private renderErrorCode(): ReactNode {
        const {
            error,
            shouldShowErrorCode = true,
        } = this.props;

        if (!error || !shouldShowErrorCode) {
            return;
        }

        const errorCode = computeErrorCode(error);

        if (!errorCode) {
            return;
        }

        return <ErrorCode code={ errorCode } />;
    }

    private handleOnRequestClose: (event: SyntheticEvent) => void = event => {
        const {
            error,
            onClose = noop,
        } = this.props;

        if (error) {
            onClose(event.nativeEvent, { error });
        }
    };
}
