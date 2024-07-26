import React, {FunctionComponent, useEffect} from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { withCheckout } from '../checkout';
import { PaymentMethod } from '@bigcommerce/checkout-sdk';

export interface WithCheckoutProps {
    providerWithCustomCheckout?: string;
    getPaymentMethod: (methodId: string) => PaymentMethod | undefined;
}

interface FastlaneWatermarkOptions {
    includeAdditionalInfo: boolean
}

interface FastlaneWatermarkComponent {
    FastlaneWatermarkComponent: (options?: FastlaneWatermarkOptions) => Promise<FastlanePrivacySettings>
}

declare global {
    interface Window {
        paypalFastlane: FastlaneWatermarkComponent;
        braintreeFastlane: FastlaneWatermarkComponent;
    }
}

interface FastlanePrivacySettings {
    render(container: string): void;
}

const FastlanePrivacySettings: FunctionComponent<WithCheckoutProps> = (props: WithCheckoutProps) => {
    const {
        getPaymentMethod,
        providerWithCustomCheckout,
    } = props;

    useEffect(() => {
        if (providerWithCustomCheckout === 'braintree' || providerWithCustomCheckout === 'braintreeacceleratedcheckout') {
            const paymentMethod = getPaymentMethod(providerWithCustomCheckout);

            if(!!paymentMethod?.initializationData?.isFastlanePrivacySettingEnabled) {
                window.braintreeFastlane.FastlaneWatermarkComponent({
                    includeAdditionalInfo: true,
                })
                    .then((result: FastlanePrivacySettings) => {
                        result.render('#fastlanePrivacySettings');
                    });
            }
        }

        if (providerWithCustomCheckout === 'paypalcommerce' || providerWithCustomCheckout === 'paypalcommerceacceleratedcheckout') {
            const paymentMethod = getPaymentMethod(providerWithCustomCheckout);

            if(!!paymentMethod?.initializationData?.isFastlanePrivacySettingEnabled) {
                window.paypalFastlane.FastlaneWatermarkComponent({
                    includeAdditionalInfo: true,
                })
                    .then((result: FastlanePrivacySettings) => {
                        result.render('#fastlanePrivacySettings');
                    });
            }
        }
    }, []);

    return <div id='fastlanePrivacySettings' data-test-id='fastlanePrivacySettings' />;
}

const mapToCheckoutProps = ({ checkoutState }: CheckoutContextProps): WithCheckoutProps => {
    return {
        getPaymentMethod: checkoutState.data.getPaymentMethod,
        providerWithCustomCheckout: checkoutState.data.getConfig()?.checkoutSettings?.providerWithCustomCheckout || '',
    };
}

export default withCheckout(mapToCheckoutProps)(FastlanePrivacySettings);