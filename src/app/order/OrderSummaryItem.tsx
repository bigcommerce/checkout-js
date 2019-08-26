import classNames from 'classnames';
import React, { memo, FunctionComponent, ReactNode } from 'react';

import { ShopperCurrency } from '../currency';

export interface OrderSummaryItemProps {
    id: string | number;
    amount: number;
    quantity: number;
    name: string;
    amountAfterDiscount?: number;
    image?: ReactNode;
    productOptions?: OrderSummaryItemOption[];
}

export interface OrderSummaryItemOption {
    testId: string;
    content: ReactNode;
}

const OrderSummaryItem: FunctionComponent<OrderSummaryItemProps> = ({
    amount,
    amountAfterDiscount,
    image,
    name,
    productOptions,
    quantity,
}) => (
    <div className="product" data-test="cart-item">
        <figure className="product-column product-figure">
            { image }
        </figure>

        <div className="product-column product-body">
            <h5
                data-test="cart-item-product-title"
                className="product-title optimizedCheckout-contentPrimary"
            >
                { quantity } x { name }
            </h5>

            <ul
                data-test="cart-item-product-options"
                className="product-options optimizedCheckout-contentSecondary"
            >
                { (productOptions || []).map((option, index) =>
                    <li
                        key={ index }
                        className="product-option"
                        data-test={ option.testId }
                    >
                        { option.content }
                    </li>
                ) }
            </ul>
        </div>

        <div className="product-column product-actions">
            <div
                className={ classNames(
                    'product-price',
                    'optimizedCheckout-contentPrimary',
                    { 'product-price--beforeDiscount': amountAfterDiscount && amountAfterDiscount !== amount }
                ) }
                data-test="cart-item-product-price"
            >
                <ShopperCurrency amount={ amount } />
            </div>

            { amountAfterDiscount && amountAfterDiscount !== amount && <div
                className="product-price"
                data-test="cart-item-product-price--afterDiscount"
            >
                <ShopperCurrency amount={ amountAfterDiscount } />
            </div> }
        </div>
    </div>
);

export default memo(OrderSummaryItem);
