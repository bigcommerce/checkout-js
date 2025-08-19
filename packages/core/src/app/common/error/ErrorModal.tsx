import { type RequestError } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { type ReactElement, type ReactNode, type SyntheticEvent } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';

import { Button, ButtonSize } from '../../ui/button';
import { IconError, IconSize } from '../../ui/icon';
import { Modal, ModalHeader } from '../../ui/modal';

import computeErrorCode from './computeErrorCode';
import ErrorCode from './ErrorCode';
import isCustomError from './isCustomError';
import isHtmlError from './isHtmlError';
import isRequestError from './isRequestError';

import { type CustomError } from './index';

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

const ErrorModal = ({
    error,
    message = error && error.message,
    onClose = noop,
    shouldShowErrorCode = true,
    title = error && isCustomError(error) && error.title,
}: ErrorModalProps): ReactElement => {
    const aria = {
        labelledby: 'errorModalMessage',
    };

    const handleOnRequestClose: (event: SyntheticEvent) => void = (event) => {
        if (error) {
            onClose(event.nativeEvent, { error });
        }
    };

    const renderHeader = (): ReactNode => (
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

    const renderBody = (): ReactNode => (
        <>
            {error && isHtmlError(error) &&
                <TranslatedHtml id={error.data.translationKey} />
            }
            {message && (
                <p aria-live="assertive" id="errorModalMessage" role="alert">
                    {message}
                </p>
            )}

            <div className="optimizedCheckout-contentSecondary">{renderErrorCode()}</div>
        </>
    );

    const renderFooter = (): ReactNode => (
        <Button onClick={handleOnRequestClose} size={ButtonSize.Small}>
            <TranslatedString id="common.ok_action" />
        </Button>
    );

    const renderErrorCode = (): ReactNode => {
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
    };

    return (
        <Modal
            additionalModalClassName="modal--error"
            aria={aria}
            footer={renderFooter()}
            header={renderHeader()}
            isOpen={!!error}
            onRequestClose={handleOnRequestClose}
        >
            {renderBody()}
        </Modal>
    );
};

export default ErrorModal;
