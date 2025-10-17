import classNames from 'classnames';
import { isNumber } from 'lodash';
import React, { type FunctionComponent, memo, type ReactNode } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';

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
    const { themeV2 } = useThemeContext();

    return (
        <div className="product" data-test="cart-item">
            <figure className="product-column product-figure">{image}</figure>

            <div className="product-column product-body">
                <h4
                    className={classNames('product-title optimizedCheckout-contentPrimary',
                        { 'body-medium': themeV2 })}
                    data-test="cart-item-product-title"
                >
                    {themeV2
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
                            'sub-text-medium': themeV2,
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
                        'body-medium': themeV2,
                    })} data-test="cart-item-product-price--afterDiscount">
                        <ShopperCurrency amount={amountAfterDiscount} />
                    </div>
                )}

                <div
                    className={classNames('product-price', 'optimizedCheckout-contentPrimary', {
                        'product-price--beforeDiscount':
                            isNumber(amountAfterDiscount) && amountAfterDiscount !== amount,
                        'body-medium': themeV2 && isNumber(amountAfterDiscount) && amountAfterDiscount === amount,
                        'body-regular': themeV2 && isNumber(amountAfterDiscount) && amountAfterDiscount !== amount,
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
