import React from 'react';

import { IconPayPalConnect } from '@bigcommerce/checkout/ui';

import './PoweredByPaypalConnectLabel.scss';

const PoweredByPaypalConnectLabel = () => (
    <div className="powered-by-paypal-connect-label" data-test="powered-by-connect-label">
        Powered by
        <IconPayPalConnect />
    </div>
);

export default PoweredByPaypalConnectLabel;
