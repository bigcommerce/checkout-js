import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconPayPalConnect, IconPayPalFastlane } from '@bigcommerce/checkout/ui';

import './PoweredByPayPalFastlaneLabel.scss';
import usePayPalFastlaneAddress from './usePayPalFastlaneAddress';

const PoweredByPayPalFastlaneLabel = () => {
    const { isPayPalFastlaneEnabled, shouldShowPayPalConnectLabel } = usePayPalFastlaneAddress();

    if (!isPayPalFastlaneEnabled) {
        return <></>;
    }

    if (shouldShowPayPalConnectLabel) {
        return (
            <div className="powered-by-paypal-fastlane">
                <div className="powered-by-paypal-fastlane-label">
                    <TranslatedString id="remote.powered_by" />
                    <IconPayPalConnect />
                </div>
            </div>
        );
    }
    return (
        <div className="powered-by-paypal-fastlane">
            <IconPayPalFastlane />
        </div>
    );
};

export default PoweredByPayPalFastlaneLabel;
