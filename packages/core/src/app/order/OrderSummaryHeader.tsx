import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import classNames from 'classnames';

const newFontStyle = true; // Assuming this is a placeholder for the actual condition

const OrderSummaryHeader: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
    <header className="cart-header">
        <h3 className={classNames('cart-title', 'optimizedCheckout-headingSecondary',
            { 'header-secondary': newFontStyle })}>
            <TranslatedString id="cart.cart_heading" />
        </h3>
        {children}
    </header>
);

export default OrderSummaryHeader;
