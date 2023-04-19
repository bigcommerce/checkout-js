import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const OrderSummaryHeader: FunctionComponent = ({ children }) => (
    <header className="cart-header">
        <h3 className="cart-title optimizedCheckout-headingSecondary">
            <TranslatedString id="cart.cart_heading" />
        </h3>
        {children}
    </header>
);

export default OrderSummaryHeader;
