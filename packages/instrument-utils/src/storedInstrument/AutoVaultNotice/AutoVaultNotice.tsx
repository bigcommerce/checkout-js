import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const AutoVaultNotice: FunctionComponent = () => (
    <p
        className="auto-vault-notice optimizedCheckout-contentSecondary sub-text-medium"
        data-test="auto-vault-notice"
    >
        <TranslatedString id="payment.auto_vault_notice_text" />
    </p>
);

export default memo(AutoVaultNotice);
