import React, { type FunctionComponent, type ReactNode } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import {
    isSurchargeEnabled,
    type SurchargeState,
    useRegisterSurchargeCardBox,
    useSurchargeState,
} from './surchargeState';

interface SurchargeProps {
    surcharge: SurchargeState;
}

// Always visible with the card form: tells the shopper a surcharge may apply before they type anything.
export const SurchargeNotice: FunctionComponent = () => (
    <div className="surchargeNotice" data-test="surcharge-notice">
        <Alert type={AlertType.Info}>
            <TranslatedHtml id="payment.surcharge_notice_text" />
        </Alert>
    </div>
);

const getResultText = (surcharge: Extract<SurchargeState, { status: 'ready' }>): ReactNode => {
    if (surcharge.legalText) {
        return surcharge.legalText;
    }

    return surcharge.rate === undefined ? (
        <TranslatedString id="payment.surcharge_result_generic_text" />
    ) : (
        <TranslatedString
            data={{ rate: surcharge.rate.toFixed(1) }}
            id="payment.surcharge_result_text"
        />
    );
};

// Below the card form: "Checking surcharge..." while calculating, the decision once it is known.
export const SurchargeStatus: FunctionComponent<SurchargeProps> = ({ surcharge }) => {
    switch (surcharge.status) {
        case 'calculating':
            return (
                <div
                    aria-live="polite"
                    className="surchargeStatus surchargeStatus--calculating"
                    data-test="surcharge-calculating"
                >
                    <span aria-hidden="true" className="surchargeStatus-spinner" />
                    <TranslatedString id="payment.surcharge_calculating_text" />
                </div>
            );

        case 'ready':
        case 'none':
        case 'error': {
            const isError = surcharge.status === 'error';

            return (
                <div
                    className="surchargeStatus"
                    data-test={
                        surcharge.status === 'ready'
                            ? 'surcharge-result'
                            : `surcharge-${surcharge.status}`
                    }
                >
                    <Alert type={isError ? AlertType.Error : AlertType.Info}>
                        {surcharge.status === 'ready' ? (
                            getResultText(surcharge)
                        ) : (
                            <TranslatedString id={`payment.surcharge_${surcharge.status}_text`} />
                        )}
                    </Alert>
                </div>
            );
        }

        default:
            return null;
    }
};

// Under the order button: why it is (not yet) usable.
export const SurchargeSubmitHint: FunctionComponent<SurchargeProps> = ({ surcharge }) => {
    if (surcharge.status !== 'idle' && surcharge.status !== 'calculating') {
        return null;
    }

    return (
        <p className="surchargeSubmitHint" data-test="surcharge-submit-hint">
            <TranslatedString
                id={
                    surcharge.status === 'idle'
                        ? 'payment.surcharge_enter_card_hint'
                        : 'payment.surcharge_calculating_hint'
                }
            />
        </p>
    );
};

// The notice and the live decision rendered INSIDE the card box, above the card fields. Reads the
// surcharge itself, so a card form only has to place it.
export const SurchargeCardBoxNotices: FunctionComponent = () => {
    const surcharge = useSurchargeState();

    useRegisterSurchargeCardBox();

    if (!isSurchargeEnabled()) {
        return null;
    }

    return (
        <div className="surchargeCardBox" data-test="surcharge-card-box">
            <SurchargeNotice />
            <SurchargeStatus surcharge={surcharge} />
        </div>
    );
};
