import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconPayPalConnect } from '@bigcommerce/checkout/ui';

import './PoweredByPaypalConnectLabel.scss';

const PoweredByPaypalConnectLabel = () => (
    <div className='powered-by-paypal-connect-label'>
        <TranslatedString id="remote.powered_by" />
        <IconPayPalConnect />
    </div>
);

export default PoweredByPaypalConnectLabel;
