import React, { type FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isFastlaneHostWindow from './is-fastlane-window';
import isPayPalFastlaneMethod from './is-paypal-fastlane-method';
import { type FastlanePrivacySettings } from './types';

import './PayPalFastlaneWatermark.scss';

const PayPalFastlaneWatermark: FunctionComponent = () => {
    const { checkoutState } = useCheckout();
    const { getPaymentMethod, getConfig } = checkoutState.data;
    const providerWithCustomCheckout =
        getConfig()?.checkoutSettings.providerWithCustomCheckout || '';

    const paymentMethod =
        !!providerWithCustomCheckout &&
        isPayPalFastlaneMethod(providerWithCustomCheckout) &&
        getPaymentMethod(providerWithCustomCheckout);

    const shouldRenderFastlaneWatermark =
        isFastlaneHostWindow(window) &&
        !!paymentMethod &&
        !!paymentMethod.initializationData?.isFastlanePrivacySettingEnabled;

    useEffect(() => {
        if (shouldRenderFastlaneWatermark && isFastlaneHostWindow(window)) {
            const fastlane = isBraintreeFastlaneMethod(providerWithCustomCheckout)
                ? window.braintreeFastlane
                : window.paypalFastlane;

            void fastlane
                .FastlaneWatermarkComponent({
                    includeAdditionalInfo: true,
                })
                .then((result: FastlanePrivacySettings) => {
                    result.render('#paypalFastlaneWatermark');
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (shouldRenderFastlaneWatermark) {
        return (
            <div className="paypalFastlaneWatermark-container">
                <div data-test="paypalFastlaneWatermark" id="paypalFastlaneWatermark" />
            </div>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
};

export default PayPalFastlaneWatermark;
