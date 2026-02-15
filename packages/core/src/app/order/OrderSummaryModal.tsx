import {
    type LineItemMap,
    type ShopperCurrency as ShopperCurrencyType,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { cloneElement, type FunctionComponent, isValidElement, type ReactNode } from 'react';

import { useCheckout, useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';
import { Button, IconCloseWithBorder } from '@bigcommerce/checkout/ui';

import { isExperimentEnabled } from '../common/utility';
import { NewOrderSummarySubtotals } from '../coupon';
import { ShopperCurrency } from '../currency';
import { Modal, ModalHeader } from '../ui/modal';
import { isMobileView } from '../ui/responsive';

import OrderModalSummarySubheader from './OrderModalSummarySubheader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { type OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';

export interface OrderSummaryDrawerProps {
    children: ReactNode;
    additionalLineItems?: ReactNode;
    items: LineItemMap;
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
    isTaxIncluded,
    taxes,
    onRequestClose,
    onAfterOpen,
    storeCurrency,
    shopperCurrency,
    isOpen,
    headerLink,
    items,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const { currency } = useLocale();
    const { checkoutState } = useCheckout();
    const { themeV2 } = useThemeContext();
    const { checkoutSettings } = checkoutState.data.getConfig() ?? {};
    const checkout = checkoutState.data.getCheckout();
    const order = checkoutState.data.getOrder();

    const isMultiCouponEnabled = isExperimentEnabled(checkoutSettings, 'CHECKOUT-9674.multi_coupon_cart_checkout', false);
    const isMultiCouponEnabledForCheckout = isMultiCouponEnabled && !!checkout;
    const isMultiCouponEnabledForOrder = isMultiCouponEnabled && !checkout && !!order;

    if (!currency) {
        return null;
    }

    let totalDiscount;
    
    if (isMultiCouponEnabledForCheckout) {
        totalDiscount = checkout.totalDiscount;
    }

    if (isMultiCouponEnabledForOrder) {
        totalDiscount = order.totalDiscount;
    }
   
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;
    const isTotalDiscountVisible = Boolean(totalDiscount && totalDiscount > 0);

    const subHeaderText = <OrderModalSummarySubheader
        amountWithCurrency={<ShopperCurrency amount={total} />}
        items={items}
        shopperCurrencyCode={shopperCurrency.code}
        storeCurrencyCode={storeCurrency.code}
    />;

    const continueButton = isMobileView() && <Button
        className='cart-modal-continue'
        data-test="manage-instrument-cancel-button"
        onClick={preventDefault(onRequestClose)}>
            <TranslatedString id="cart.return_to_checkout" />
    </Button>;

    return <Modal
        additionalBodyClassName="cart-modal-body optimizedCheckout-orderSummary"
        additionalHeaderClassName="cart-modal-header optimizedCheckout-orderSummary with-continue-button"
        additionalModalClassName={classNames("optimizedCheckout-cart-modal", { "themeV2": themeV2 })}
        footer={continueButton}
        header={renderHeader({
            headerLink,
            subHeaderText,
            onRequestClose,
        })}
        isOpen={isOpen}
        onAfterOpen={onAfterOpen}
        onRequestClose={onRequestClose}
    >
        <OrderSummarySection>
            <OrderSummaryItems displayLineItemsCount={false} items={items} />
        </OrderSummarySection>
        {isMultiCouponEnabledForCheckout || isMultiCouponEnabledForOrder
            ? <NewOrderSummarySubtotals
                fees={orderSummarySubtotalsProps.fees}
                giftWrappingAmount={orderSummarySubtotalsProps.giftWrappingAmount}
                handlingAmount={orderSummarySubtotalsProps.handlingAmount}
                isOrderConfirmation={!!isMultiCouponEnabledForOrder}
                isTaxIncluded={isTaxIncluded}
                storeCreditAmount={orderSummarySubtotalsProps.storeCreditAmount}
                taxes={taxes}
            />
            : <OrderSummarySection>
                    <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} />
                    {additionalLineItems}
            </OrderSummarySection>
        }
        <OrderSummarySection>
            <OrderSummaryTotal
                orderAmount={total}
                shopperCurrencyCode={shopperCurrency.code}
                storeCurrencyCode={storeCurrency.code}
            />
            {(isTotalDiscountVisible && totalDiscount) &&
                <div className="total-savings">
                    <TranslatedHtml
                        data={{ totalDiscount: currency.toCustomerCurrency(totalDiscount) }}
                        id="redeemable.total_savings_text"
                    />
                </div>
            }
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
    onRequestClose?(): void;
}> = ({ onRequestClose, headerLink, subHeaderText }) => {
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
