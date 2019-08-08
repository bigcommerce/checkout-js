import { noop, some } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { AccountCreationFailedError, AccountCreationRequirementsError } from '../../../guestSignup/errors';
import { TranslatedString } from '../../../language';
import { Button, ButtonSize } from '../../../ui/button';
import { IconError, IconSize } from '../../../ui/icon';
import { Modal, ModalHeader } from '../../../ui/modal';
import isCustomError from '../customError/isCustomError';
import computeErrorCode from '../errorCode/computeErrorCode';
import ErrorCode from '../errorCode/ErrorCode';

export interface ErrorModalProps {
    error?: Error;
    message?: ReactNode;
    title?: ReactNode;
    onClose?(event: Event, props: ErrorModalOnCloseProps): void;
}

export interface ErrorModalOnCloseProps {
    error: Error;
}

// todo: properly check if the error should report or not
// for now, hard code errors that should not report.
const IGNORED_ERRORS = [
    AccountCreationFailedError,
    AccountCreationRequirementsError,
];

class ErrorModal extends Component<ErrorModalProps> {
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
                onClick={ event => this.handleOnRequestClose(event.nativeEvent) }
                size={ ButtonSize.Small }
            >
                <TranslatedString id="common.ok_action" />
            </Button>
        );
    }

    private renderErrorCode(): ReactNode {
        const { error } = this.props;

        if (!error || some(IGNORED_ERRORS, ignoredError => error instanceof ignoredError)) {
            return;
        }

        const errorCode = computeErrorCode(error);

        if (!errorCode) {
            return;
        }

        return <ErrorCode code={ errorCode } />;
    }

    private handleOnRequestClose: (event: Event) => void = event => {
        const {
            error,
            onClose = noop,
        } = this.props;

        if (error) {
            onClose(event, { error });
        }
    };
}

export default ErrorModal;
