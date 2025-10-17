import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

const OrderSummaryHeader: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => {
    const { themeV2 } = useThemeContext();

    return (
        <header className="cart-header">
            <h3 className={classNames('cart-title', 'optimizedCheckout-headingSecondary',
                { 'sub-header': themeV2 })}>
                <TranslatedString id="cart.cart_heading" />
            </h3>
            {children}
        </header>
    );
}

export default OrderSummaryHeader;
