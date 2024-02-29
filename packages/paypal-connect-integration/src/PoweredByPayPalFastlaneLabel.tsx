import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconPayPalConnect } from '@bigcommerce/checkout/ui';

import './PoweredByPayPalFastlaneLabel.scss';

const PoweredByPayPalFastlaneLabel = () => (
    <div className="powered-by-paypal-fastlane">
        <div className="powered-by-paypal-fastlane-label">
            <TranslatedString id="remote.powered_by" />
            {/* TODO: update Icon with PayPal Fastlane */}
            <IconPayPalConnect />
        </div>
    </div>
);

export default PoweredByPayPalFastlaneLabel;
