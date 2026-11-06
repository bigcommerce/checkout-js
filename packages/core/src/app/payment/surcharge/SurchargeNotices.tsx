import React, { type FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import {
    isSurchargeEnabled,
    type SurchargeState,
    useRegisterSurchargeCardBox,
    useSurchargeState,
} from './surchargeState';

// Always visible with the card form: tells the shopper a surcharge may apply before they type anything.
export const SurchargeNotice: FunctionComponent = () => (
    <div className="surchargeNotice" data-test="surcharge-notice">
        <Alert type={AlertType.Info}>
            <TranslatedHtml id="payment.surcharge_notice_text" />
        </Alert>
    </div>
);

// Below the card form: "Checking surcharge..." while calculating, the decision once it is known.
export const SurchargeStatus: FunctionComponent<{ surcharge: SurchargeState }> = ({
    surcharge,
}) => {
    if (surcharge.status === 'calculating') {
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
    }

    if (surcharge.status === 'ready') {
        return (
            <div className="surchargeStatus" data-test="surcharge-result">
                <Alert type={AlertType.Info}>
                    {surcharge.legalText ? (
                        surcharge.legalText
                    ) : surcharge.rate === undefined ? (
                        <TranslatedString id="payment.surcharge_result_generic_text" />
                    ) : (
                        <TranslatedString
                            data={{ rate: surcharge.rate.toFixed(1) }}
                            id="payment.surcharge_result_text"
                        />
                    )}
                </Alert>
            </div>
        );
    }

    if (surcharge.status === 'none') {
        return (
            <div className="surchargeStatus" data-test="surcharge-none">
                <Alert type={AlertType.Info}>
                    <TranslatedString id="payment.surcharge_none_text" />
                </Alert>
            </div>
        );
    }

    if (surcharge.status === 'error') {
        return (
            <div className="surchargeStatus" data-test="surcharge-error">
                <Alert type={AlertType.Error}>
                    <TranslatedString id="payment.surcharge_error_text" />
                </Alert>
            </div>
        );
    }

    return null;
};

// Under the order button, as in the prototype.
export const SurchargeSubmitHint: FunctionComponent<{ surcharge: SurchargeState }> = ({
    surcharge,
}) => {
    if (surcharge.status === 'idle') {
        return (
            <p className="surchargeSubmitHint" data-test="surcharge-submit-hint">
                <TranslatedString id="payment.surcharge_enter_card_hint" />
            </p>
        );
    }

    if (surcharge.status === 'calculating') {
        return (
            <p className="surchargeSubmitHint" data-test="surcharge-submit-hint">
                <TranslatedString id="payment.surcharge_calculating_hint" />
            </p>
        );
    }

    return null;
};

// The notice and the live decision rendered INSIDE the card box, above the card fields. Reads the
// surcharge itself, so a card form (e.g. HostedCreditCardFieldset) only has to place it.
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
