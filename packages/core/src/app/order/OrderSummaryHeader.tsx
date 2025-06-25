import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

const OrderSummaryHeader: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => {
    const { newFontStyle } = useStyleContext();

    return (
        <header className="cart-header">
            <h3 className={classNames('cart-title', 'optimizedCheckout-headingSecondary',
                { 'sub-header': newFontStyle })}>
                <TranslatedString id="cart.cart_heading" />
            </h3>
            {children}
        </header>
    );
}

export default OrderSummaryHeader;
