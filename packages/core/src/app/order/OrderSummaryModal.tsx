import {
    LineItemMap,
    ShopperCurrency as ShopperCurrencyType,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { cloneElement, FunctionComponent, isValidElement, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { preventDefault } from '../common/dom';
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
    const newDisplay = true;

    return <Modal
        additionalBodyClassName="cart-modal-body optimizedCheckout-orderSummary"
        additionalHeaderClassName="cart-modal-header optimizedCheckout-orderSummary"
        header={renderHeader({ headerLink, onRequestClose, newDisplay })}
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
    newDisplay: boolean;
}> = ({ onRequestClose, headerLink, newDisplay }) => {
    if (!newDisplay) {
       return <>
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
        </>;
    }

    let newHeaderLink;

    if (isValidElement(headerLink)) {
        newHeaderLink = cloneElement(headerLink, { className: 'modal-header-link cart-modal-link test' });
    }

    return <>
        {newHeaderLink ?? headerLink}
        <ModalHeader additionalClassName="cart-modal-title">
            <div>
                <TranslatedString id="cart.cart_heading" />
                <div style={{fontWeight: 500, fontSize: '1rem'}}>1 Items ($500.00)</div>
            </div>
        </ModalHeader>
        <a className="cart-modal-close" href="#" onClick={preventDefault(onRequestClose)}>
            <span className="is-srOnly">
                <TranslatedString id="common.close_action" />
            </span>
            <IconClose />
        </a>
    </>
};

export default OrderSummaryModal;
