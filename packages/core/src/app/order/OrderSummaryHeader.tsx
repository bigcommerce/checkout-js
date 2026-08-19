import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

interface OrderSummaryHeaderProps {
    children?: React.ReactNode;
    itemsCount?: number;
}

const OrderSummaryHeader: FunctionComponent<OrderSummaryHeaderProps> = ({
    children,
    itemsCount,
}) => {
    const showItemsCount = itemsCount !== undefined;

    return (
        <header className="cart-header">
            <h3
                className="cart-title optimizedCheckout-headingSecondary sub-header"
                data-test={showItemsCount ? 'cart-count-total' : undefined}
            >
                {showItemsCount ? (
                    <TranslatedString data={{ count: itemsCount }} id="cart.item_count_text" />
                ) : (
                    <TranslatedString id="cart.cart_heading" />
                )}
            </h3>
            {children}
        </header>
    );
};

export default OrderSummaryHeader;
