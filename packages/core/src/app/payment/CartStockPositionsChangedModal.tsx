import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ButtonVariant } from '@bigcommerce/checkout/ui';

import { Button } from '../ui/button';
import { Modal, ModalHeader } from '../ui/modal';

import getOrderSummaryItemImage from '../order/getOrderSummaryItemImage';

export interface CartStockPositionsChangedModalProps {
    isOpen: boolean;
    lineItems: LineItemMap | undefined;
    onPlaceOrder(): void;
    onRequestClose(): void;
}

const CartStockPositionsChangedModal: FunctionComponent<CartStockPositionsChangedModalProps> = ({
    isOpen,
    lineItems,
    onPlaceOrder,
    onRequestClose,
}) => {
    const { themeV2 } = useThemeContext();

    const changedItems = useMemo(() => {
        if (!lineItems) {
            return [];
        }
        return [...lineItems.physicalItems];
    }, [lineItems]);

    const modalFooter = (
        <>
            <Button
                className={themeV2 ? 'body-medium' : ''}
                onClick={onRequestClose}
                variant={ButtonVariant.Secondary}
            >
                <TranslatedString id="common.back_action" />
            </Button>
            <Button
                className={themeV2 ? 'body-medium' : ''}
                onClick={onPlaceOrder}
                variant={ButtonVariant.Primary}
            >
                <TranslatedString id="payment.place_order_action" />
            </Button>
        </>
    );

    return (
        <Modal
            additionalModalClassName="cart-stock-positions-changed-modal"
            footer={modalFooter}
            header={
                <ModalHeader additionalClassName={themeV2 ? 'header' : ''}>
                    <TranslatedString id="cart.backorder_quantities_changed_heading" />
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            <ul className="productList" data-test="cart-stock-positions-changed-items">
                {changedItems.map((item) => {
                    const stock = item.stockPosition;
                    const quantityOnHand = stock?.quantityOnHand ?? 0;
                    const quantityBackordered = stock?.quantityBackordered ?? 0;
                    const backorderMessage = stock?.backorderMessage;

                    return (
                        <li className="productList-item" key={item.id} data-test="cart-stock-positions-changed-item">
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
                                        className={classNames(
                                            'optimizedCheckout-contentSecondary',
                                            { 'sub-text-medium': themeV2 },
                                        )}
                                        data-test="cart-item-quantity"
                                    >
                                        <TranslatedString
                                            data={{ quantity: item.quantity }}
                                            id="cart.qty_label"
                                        />
                                    </p>
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
                                                    id="cart.ready_to_ship"
                                                />
                                                {quantityBackordered > 0 && ' '}
                                            </span>
                                        )}
                                        {quantityBackordered > 0 && (
                                            <span className="cart-stock-position-backorder">
                                                <TranslatedString
                                                    data={{ count: quantityBackordered }}
                                                    id="cart.will_be_backordered"
                                                />
                                            </span>
                                        )}
                                        {backorderMessage && (
                                            <span className="cart-stock-position-lead-time">
                                                {' '}
                                                <TranslatedString
                                                    data={{ message: backorderMessage }}
                                                    id="cart.lead_time"
                                                />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Modal>
    );
};

export default CartStockPositionsChangedModal;
