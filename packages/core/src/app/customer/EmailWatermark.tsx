import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { FastlanePrivacySettings, isFastlaneHostWindow } from '@bigcommerce/checkout/paypal-fastlane-integration';

const EmailWatermark: FunctionComponent = () => {
    const { checkoutState } = useCheckout();
    const { getPaymentMethod } = checkoutState.data;
    const providerWithCustomCheckout = checkoutState.data.getConfig()?.checkoutSettings?.providerWithCustomCheckout;
    const isFastlaneProviderWithCustomCheckout =
        providerWithCustomCheckout === 'braintree' ||
        providerWithCustomCheckout === 'braintreeacceleratedcheckout' ||
        providerWithCustomCheckout === 'paypalcommerce' ||
        providerWithCustomCheckout === 'paypalcommerceacceleratedcheckout';

    useEffect(() => {
        if (isFastlaneProviderWithCustomCheckout) {
            const paymentMethod = getPaymentMethod(providerWithCustomCheckout);

            if(
                paymentMethod?.initializationData?.isFastlanePrivacySettingEnabled &&
                isFastlaneHostWindow(window)
            ) {
                const fastlane = window.braintreeFastlane || window.paypalFastlane;
                fastlane.FastlaneWatermarkComponent({
                    includeAdditionalInfo: true,
                })
                    .then((result: FastlanePrivacySettings) => {
                        result.render('#emailWatermark');
                    });
            }
        }
    }, []);

    const shouldRenderWatermark = (): boolean => {
        if (isFastlaneProviderWithCustomCheckout) {
            const paymentMethod = getPaymentMethod(providerWithCustomCheckout);

            return isFastlaneHostWindow(window)
                && !!(window.braintreeFastlane || window.paypalFastlane)
                && paymentMethod?.initializationData?.isFastlanePrivacySettingEnabled
        }

        return false;
    };

    return (
        shouldRenderWatermark() ? (
            <div className='emailWatermark-container'>
                <div id='emailWatermark' data-test-id='emailWatermark' />
            </div>
        ) : (
            <></>
        )
    );
}

export default EmailWatermark;
