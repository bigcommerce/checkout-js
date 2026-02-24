import { type PhysicalItem } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import getOrderSummaryItemImage from '../order/getOrderSummaryItemImage';

export interface CartStockPositionsChangedItemProps {
    item: PhysicalItem;
}

const CartStockPositionsChangedItem: FunctionComponent<CartStockPositionsChangedItemProps> = ({ item }) => {
    const { themeV2 } = useThemeContext();

    const stock = item.stockPosition;
    const quantityOnHand = stock?.quantityOnHand ?? 0;
    const quantityBackordered = stock?.quantityBackordered ?? 0;
    const backorderMessage = stock?.backorderMessage ?? '';

    return (
        <li
            className="productList-item"
            data-test="cart-stock-positions-changed-item"
        >
            <div className="product">
                <figure className="product-column product-figure">
                    {getOrderSummaryItemImage(item)}
                </figure>
                <div className="product-column product-body">
                    <h4
                        className={classNames(
                            'product-title optimizedCheckout-contentPrimary',
                            { 'body-medium': themeV2 },
                        )}
                        data-test="cart-item-product-title"
                    >
                        {item.name}
                    </h4>
                    {item.options && item.options.length > 0 && (
                        <ul
                            className={classNames(
                                'product-options optimizedCheckout-contentSecondary',
                                { 'sub-text-medium': themeV2 },
                            )}
                            data-test="cart-item-product-options"
                        >
                            {item.options.map((option, index) => (
                                <li
                                    className="product-option"
                                    data-test="cart-item-product-option"
                                    key={index}
                                >
                                    {option.name} {option.value}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p
                        className={classNames('optimizedCheckout-contentSecondary', {
                            'sub-text-medium': themeV2,
                        })}
                        data-test="cart-item-quantity"
                    >
                        <TranslatedString
                            data={{ quantity: item.quantity }}
                            id="cart.qty_label"
                        />
                    </p>
                </div>
                <div
                    className={classNames(
                        'cart-stock-position-details optimizedCheckout-contentSecondary',
                        { 'sub-text-medium': themeV2 },
                    )}
                    data-test="cart-item-stock-position"
                >
                    {quantityOnHand > 0 && (
                        <span>
                            <TranslatedString
                                data={{ count: quantityOnHand }}
                                id="cart.qty_on_hand_prompt"
                            />
                        </span>
                    )}
                    {quantityBackordered > 0 && (
                        <span className="cart-stock-position-backorder">
                            {' '}
                            <TranslatedString
                                data={{ count: quantityBackordered }}
                                id="cart.qty_on_backorder_prompt"
                            />
                        </span>
                    )}
                    {backorderMessage && (
                        <span className="cart-stock-position-backorder-message">
                            {backorderMessage}
                        </span>
                    )}
                </div>
            </div>
        </li>
    );
};

export default CartStockPositionsChangedItem;
