import React, { type ReactElement, useEffect, useState } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface EmptyCartMessageProps {
    waitInterval?: number;
    loginUrl: string;
}

const EmptyCartMessage = ({ waitInterval, loginUrl }: EmptyCartMessageProps): ReactElement => {
    const [isWaiting, setIsWaiting] = useState(true);

    useEffect(() => {
        const waitToken = setTimeout(() => {
            setIsWaiting(false);
        }, waitInterval);

        return () => {
            clearTimeout(waitToken);
        };
    }, [waitInterval]);

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isWaiting}>
            <TranslatedHtml data={{ url: loginUrl }} id="cart.empty_cart_message" />
        </LoadingOverlay>
    );
};

export default EmptyCartMessage;
