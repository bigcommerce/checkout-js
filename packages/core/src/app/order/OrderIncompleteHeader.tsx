import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const OrderIncompleteHeader: FunctionComponent = () => (
    <h3 className="optimizedCheckout-headingOrderIncomplete" data-test="order-confirmation-heading">
        <TranslatedString id="order_confirmation.order_incomplete_status_heading" />
    </h3>
);

export default memo(OrderIncompleteHeader);
