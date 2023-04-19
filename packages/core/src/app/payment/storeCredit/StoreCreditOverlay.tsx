import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const StoreCreditOverlay: FunctionComponent = () => (
    <div className="storeCreditOverlay" data-test="payment-store-credit-overlay">
        <p className="storeCreditOverlay-text">
            <TranslatedString id="payment.payment_not_required_text" />
        </p>
    </div>
);

export default StoreCreditOverlay;
