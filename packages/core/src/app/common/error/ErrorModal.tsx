import { RequestError } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode, SyntheticEvent } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';

import { Button, ButtonSize } from '../../ui/button';
import { IconError, IconSize } from '../../ui/icon';
import { Modal, ModalHeader } from '../../ui/modal';

import computeErrorCode from './computeErrorCode';
import ErrorCode from './ErrorCode';
import isCustomError from './isCustomError';
import isRequestError from './isRequestError';
import isHtmlError from './isHtmlError';
import { CustomError } from './index';

export interface ErrorModalProps {
    error?: Error | RequestError | CustomError;
    message?: ReactNode;
    title?: ReactNode;
    shouldShowErrorCode?: boolean;
    onClose?(event: Event, props: ErrorModalOnCloseProps): void;
}

export interface ErrorModalOnCloseProps {
    error: Error;
}

export default class ErrorModal extends PureComponent<ErrorModalProps> {
    private aria = {
        labelledby: 'errorModalMessage',
    };

    render(): ReactNode {
        const { error } = this.props;

        return (
            <Modal
                additionalModalClassName="modal--error"
                aria={this.aria}
                footer={this.renderFooter()}
                header={this.renderHeader()}
                isOpen={!!error}
                onRequestClose={this.handleOnRequestClose}
            >
                {this.renderBody()}
            </Modal>
        );
    }

    private renderHeader(): ReactNode {
        const { error, title = error && isCustomError(error) && error.title } = this.props;

        return (
            <ModalHeader>
                <IconError
                    additionalClassName="icon--error modal-header-icon"
                    size={IconSize.Small}
                />
                <span aria-live="assertive" role="alert">
                    {title || <TranslatedString id="common.error_heading" />}
                </span>
            </ModalHeader>
        );
    }

    private renderBody(): ReactNode {
        const { error, message = error && error.message } = this.props;

        return (
            <>
                {error && isHtmlError(error) &&
                    <TranslatedHtml id={error.data.translationKey} />
                }
                {message && (
                    <p aria-live="assertive" id="errorModalMessage" role="alert">
                        {message}
                    </p>
                )}

                <div className="optimizedCheckout-contentSecondary">{this.renderErrorCode()}</div>
            </>
        );
    }

    private renderFooter(): ReactNode {
        return (
            <Button onClick={this.handleOnRequestClose} size={ButtonSize.Small}>
                <TranslatedString id="common.ok_action" />
            </Button>
        );
    }

    private renderErrorCode(): ReactNode {
        const { error, shouldShowErrorCode = true } = this.props;

        if (!error || !shouldShowErrorCode) {
            return;
        }

        if (isRequestError(error) && error.headers?.['x-request-id']) {
            return (
                <ErrorCode
                    code={error.headers['x-request-id']}
                    label={<TranslatedString id="common.request_id" />}
                />
            );
        }

        const errorCode = computeErrorCode(error);

        if (!errorCode) {
            return;
        }

        return <ErrorCode code={errorCode} />;
    }

    private handleOnRequestClose: (event: SyntheticEvent) => void = (event) => {
        const { error, onClose = noop } = this.props;

        if (error) {
            onClose(event.nativeEvent, { error });
        }
    };
}
