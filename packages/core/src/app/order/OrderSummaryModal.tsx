import {
    LineItemMap,
    ShopperCurrency as ShopperCurrencyType,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, ReactNode } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { IconClose } from '../ui/icon';
import { Modal, ModalHeader } from '../ui/modal';

import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
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

const OrderSummaryModal: FunctionComponent<
    OrderSummaryDrawerProps & OrderSummarySubtotalsProps
> = ({
    additionalLineItems,
    children,
    isTaxIncluded,
    taxes,
    onRequestClose,
    onAfterOpen,
    storeCurrency,
    shopperCurrency,
    isOpen,
    headerLink,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;

    return <Modal
        additionalBodyClassName="cart-modal-body optimizedCheckout-orderSummary"
        additionalHeaderClassName="cart-modal-header optimizedCheckout-orderSummary"
        header={renderHeader({ headerLink, onRequestClose })}
        isOpen={isOpen}
        onAfterOpen={onAfterOpen}
        onRequestClose={onRequestClose}
    >
        <OrderSummarySection>
            <OrderSummaryItems items={lineItems} />
        </OrderSummarySection>
        <OrderSummarySection>
            <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} />
            {additionalLineItems}
        </OrderSummarySection>
        <OrderSummarySection>
            <OrderSummaryTotal
                orderAmount={total}
                shopperCurrencyCode={shopperCurrency.code}
                storeCurrencyCode={storeCurrency.code}
            />
        </OrderSummarySection>
        {displayInclusiveTax && <OrderSummarySection>
                <h5
                    className="cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary"
                    data-test="tax-text"
                >
                    <TranslatedString
                        id="tax.inclusive_label"
                    />
                </h5>
                {(taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}
            </OrderSummarySection>}
    </Modal>
};

const renderHeader: FunctionComponent<{
    headerLink: ReactNode;
    onRequestClose?(): void;
}> = ({ onRequestClose, headerLink }) => (
    <>
        <a className="cart-modal-close" href="#" onClick={preventDefault(onRequestClose)}>
            <span className="is-srOnly">
                <TranslatedString id="common.close_action" />
            </span>
            <IconClose />
        </a>
        <ModalHeader additionalClassName="cart-modal-title">
            <TranslatedString id="cart.cart_heading" />
        </ModalHeader>

        {headerLink}
    </>
);

export default OrderSummaryModal;
