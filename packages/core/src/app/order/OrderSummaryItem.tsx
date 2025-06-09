import classNames from 'classnames';
import { isNumber } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { ShopperCurrency } from '../currency';

export interface OrderSummaryItemProps {
    id: string | number;
    amount: number;
    quantity: number;
    name: string;
    amountAfterDiscount?: number;
    image?: ReactNode;
    description?: ReactNode;
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
    description,
}) => {
    const { newFontStyle } = useStyleContext();

    return (
        <div className="product" data-test="cart-item">
            <figure className="product-column product-figure">{image}</figure>

            <div className="product-column product-body">
                <h4
                    className={classNames('product-title optimizedCheckout-contentPrimary',
                        { 'body-medium': newFontStyle })}
                    data-test="cart-item-product-title"
                >
                    {newFontStyle
                        ? (<span className="body-bold">
                            {`${quantity} x `}
                        </span>)
                        : (`${quantity} x `)
                    }
                    {name}
                </h4>
                {productOptions && productOptions.length > 0 && (
                    <ul
                        className={classNames('product-options optimizedCheckout-contentSecondary', {
                            'sub-text-medium': newFontStyle,
                        })}
                        data-test="cart-item-product-options"
                    >
                        {productOptions.map((option, index) => (
                            <li className="product-option" data-test={option.testId} key={index}>
                                {option.content}
                            </li>
                        ))}
                    </ul>
                )}
                {description && (
                    <div
                        className="product-description optimizedCheckout-contentSecondary"
                        data-test="cart-item-product-description"
                    >
                        {description}
                    </div>
                )}
            </div>

            <div className="product-column product-actions">
                {isNumber(amountAfterDiscount) && amountAfterDiscount !== amount && (
                    <div className={classNames('product-price', {
                        'body-medium': newFontStyle,
                    })} data-test="cart-item-product-price--afterDiscount">
                        <ShopperCurrency amount={amountAfterDiscount} />
                    </div>
                )}

                <div
                    className={classNames('product-price', 'optimizedCheckout-contentPrimary', {
                        'product-price--beforeDiscount':
                            isNumber(amountAfterDiscount) && amountAfterDiscount !== amount,
                        'body-medium': newFontStyle && isNumber(amountAfterDiscount) && amountAfterDiscount === amount,
                        'body-regular': newFontStyle && isNumber(amountAfterDiscount) && amountAfterDiscount !== amount,
                    })}
                    data-test="cart-item-product-price"
                >
                    <ShopperCurrency amount={amount} />
                </div>
            </div>
        </div>
    );
}

export default memo(OrderSummaryItem);
