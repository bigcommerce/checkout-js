import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

const OrderSummaryHeader: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <header className="cart-header">
            <h3 className="cart-title optimizedCheckout-headingSecondary sub-header">
                <TranslatedString id="cart.cart_heading" />
            </h3>
            {children}
        </header>
    );
}

export default OrderSummaryHeader;
