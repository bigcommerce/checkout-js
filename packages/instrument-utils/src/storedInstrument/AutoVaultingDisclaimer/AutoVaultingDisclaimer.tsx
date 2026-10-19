import { type TranslationData } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface AutoVaultingDisclaimerProps {
    translationId?: string;
    translationData?: TranslationData;
}

const AutoVaultingDisclaimer: FunctionComponent<AutoVaultingDisclaimerProps> = ({
    translationId = 'payment.auto_vaulting_disclaimer',
    translationData,
}) => (
    <p
        className="auto-vaulting-disclaimer optimizedCheckout-secondaryDarkest sub-text-medium"
        data-test="auto-vaulting-disclaimer"
    >
        <TranslatedString data={translationData} id={translationId} />
    </p>
);

export default memo(AutoVaultingDisclaimer);
