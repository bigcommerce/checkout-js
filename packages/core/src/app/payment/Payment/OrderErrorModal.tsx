import type { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import {
    ErrorModal,
    type ErrorModalOnCloseProps,
} from '../../common/error';
import mapSubmitOrderErrorMessage, { mapSubmitOrderErrorTitle } from '../mapSubmitOrderErrorMessage';

export interface OrderErrorModalProps {
    submitOrderError: Error | undefined;
    finalizeOrderError: Error | undefined;
    language: LanguageService;
    onClose(event: Event, props: ErrorModalOnCloseProps): void;
}

export const OrderErrorModal = ({
    submitOrderError,
    finalizeOrderError,
    language,
    onClose,
}: OrderErrorModalProps): ReactElement | null => {
    const error = submitOrderError || finalizeOrderError;

    if (!error || ('type' in error &&(
        error.type === 'order_finalization_not_required' ||
        error.type === 'payment_cancelled' ||
        error.type === 'payment_invalid_form' ||
        error.type === 'spam_protection_not_completed' ||
        error.type === 'invalid_hosted_form_value'
    ))) {
        return null;
    }

    return (
        <ErrorModal
            error={error}
            message={mapSubmitOrderErrorMessage(
                error,
                language.translate.bind(language),
            )}
            onClose={onClose}
            title={mapSubmitOrderErrorTitle(error, language.translate.bind(language))}
        />
    );
};

