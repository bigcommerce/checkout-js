import {
    LineItemMap,
    ShopperCurrency as ShopperCurrencyType,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { cloneElement, FunctionComponent, isValidElement, ReactNode, useMemo } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Button, IconCloseWithBorder } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../currency';
import { IconClose } from '../ui/icon';
import { Modal, ModalHeader } from '../ui/modal';
import { isSmallScreen } from '../ui/responsive';

import OrderModalSummarySubheader from './OrderModalSummarySubheader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';

export interface OrderSummaryDrawerProps {
    additionalLineItems?: ReactNode;
    lineItems: LineItemMap;
    total: number;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    isOpen: boolean;
    headerLink?: ReactNode & React.HTMLProps<HTMLDivElement>;
    onRequestClose?(): void;
    onAfterOpen?(): void;
}

const OrderSummaryModal: FunctionComponent<
    OrderSummaryDrawerProps & OrderSummarySubtotalsProps
> = ({
    additionalLineItems,
    children,
    isTaxIncluded,
    isUpdatedCartSummayModal = false,
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
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;

    const subHeaderText = <OrderModalSummarySubheader
        amountWithCurrency={<ShopperCurrency amount={total} />}
        items={lineItems}
        shopperCurrencyCode={shopperCurrency.code}
        storeCurrencyCode={storeCurrency.code}
    />;

    const continueButton = isUpdatedCartSummayModal && isSmallScreen() && <Button
        className='cart-modal-continue'
        data-test="manage-instrument-cancel-button"
        onClick={preventDefault(onRequestClose)}>
            <TranslatedString id="cart.return_to_checkout" />
    </Button>;

    return <Modal
        additionalBodyClassName="cart-modal-body optimizedCheckout-orderSummary"
        additionalHeaderClassName={`cart-modal-header optimizedCheckout-orderSummary${isUpdatedCartSummayModal ? ' with-continue-button' : ''}`}
        additionalModalClassName={isUpdatedCartSummayModal ? 'optimizedCheckout-cart-modal' : ''}
        footer={continueButton}
        header={renderHeader({
            headerLink,
            subHeaderText,
            isUpdatedCartSummayModal,
            onRequestClose,
        })}
        isOpen={isOpen}
        onAfterOpen={onAfterOpen}
        onRequestClose={onRequestClose}
    >
        <OrderSummarySection>
            <OrderSummaryItems displayLineItemsCount={!isUpdatedCartSummayModal} items={nonBundledLineItems} />
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
    headerLink?: ReactNode & React.HTMLProps<HTMLDivElement>;
    subHeaderText: ReactNode;
    isUpdatedCartSummayModal: boolean;
    onRequestClose?(): void;
}> = ({ onRequestClose, headerLink, subHeaderText, isUpdatedCartSummayModal }) => {
    if (!isUpdatedCartSummayModal) {
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
                <div className='cart-heading-subheader'>{subHeaderText}</div>
            </div>
        </ModalHeader>
        <a className="cart-modal-close" href="#" onClick={preventDefault(onRequestClose)}>
            <span className="is-srOnly">
                <TranslatedString id="common.close_action" />
            </span>
            <IconCloseWithBorder />
        </a>
    </>
};

export default OrderSummaryModal;
