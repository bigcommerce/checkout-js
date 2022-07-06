import { LineItemMap, ShopperCurrency as ShopperCurrencyType, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { IconClose } from '../ui/icon';
import { Modal, ModalHeader } from '../ui/modal';

import OrderSummaryItems from './OrderSummaryItems';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';

export interface OrderSummaryDrawerProps {
    additionalLineItems?: ReactNode;
    lineItems: LineItemMap;
    total: number;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    isOpen: boolean;
    headerLink?: ReactNode;
    onRequestClose?(): void;
    onAfterOpen?(): void;
}

const OrderSummaryModal: FunctionComponent<OrderSummaryDrawerProps & OrderSummarySubtotalsProps> = ({
    additionalLineItems,
    children,
    onRequestClose,
    onAfterOpen,
    storeCurrency,
    shopperCurrency,
    isOpen,
    headerLink,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => (
<Modal
    additionalBodyClassName="cart-modal-body optimizedCheckout-orderSummary"
    additionalHeaderClassName="cart-modal-header optimizedCheckout-orderSummary"
    header={ renderHeader({ headerLink, onRequestClose }) }
    isOpen={ isOpen }
    onAfterOpen={ onAfterOpen }
    onRequestClose={ onRequestClose }
>
    <OrderSummarySection>
        <OrderSummaryItems items={ lineItems } />
    </OrderSummarySection>
    <OrderSummarySection>
        <OrderSummarySubtotals
            { ...orderSummarySubtotalsProps }
        />
        { additionalLineItems }
    </OrderSummarySection>
    <OrderSummarySection>
        <OrderSummaryTotal
            orderAmount={ total }
            shopperCurrencyCode={ shopperCurrency.code }
            storeCurrencyCode={ storeCurrency.code }
        />
    </OrderSummarySection>
</Modal>
);

const renderHeader: FunctionComponent<{
    headerLink: ReactNode;
    onRequestClose?(): void;
}> = ({
    onRequestClose,
    headerLink,
}) => (<Fragment>
    <a
        className="cart-modal-close"
        href="#"
        onClick={ preventDefault(onRequestClose) }
    >
        <span className="is-srOnly">
            <TranslatedString id="common.close_action" />
        </span>
        <IconClose />
    </a>
    <ModalHeader additionalClassName="cart-modal-title">
        <TranslatedString id="cart.cart_heading" />
    </ModalHeader>

    { headerLink }
</Fragment>);

export default OrderSummaryModal;
