import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const AutoVaultingDisclaimer: FunctionComponent = () => (
    <p
        className="auto-vaulting-disclaimer optimizedCheckout-secondaryDarkest sub-text-medium"
        data-test="auto-vaulting-disclaimer"
    >
        <TranslatedString id="payment.auto_vaulting_disclaimer" />
    </p>
);

export default memo(AutoVaultingDisclaimer);
