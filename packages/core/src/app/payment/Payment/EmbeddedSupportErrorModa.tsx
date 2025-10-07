import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement } from 'react';

import { ErrorModal, type ErrorModalOnCloseProps } from '../../common/error';

export interface EmbeddedSupportErrorModalProps {
    methods: PaymentMethod[];
    checkEmbeddedSupport(methodIds: string[]): void;
    onClose(event: Event, props: ErrorModalOnCloseProps): void;
}

export const EmbeddedSupportErrorModal = ({
    methods,
    checkEmbeddedSupport,
    onClose,
}: EmbeddedSupportErrorModalProps): ReactElement | null => {
    try {
        checkEmbeddedSupport(methods.map(({ id }) => id));
    } catch (error) {
        if (error instanceof Error) {
            return <ErrorModal error={error} onClose={onClose} />;
        }
    }

    return null;
};

