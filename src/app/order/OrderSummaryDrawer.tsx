import {
    LineItemMap,
    ShopperCurrency as ShopperCurrencyType,
    StoreCurrency
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { useCallback, FunctionComponent, ReactNode } from 'react';

import { ShopperCurrency } from '../currency';
import { TranslatedString } from '../locale';
import { IconGiftCertificate } from '../ui/icon';
import { ModalTrigger } from '../ui/modal';

import getItemsCount from './getItemsCount';
import getLineItemsCount from './getLineItemsCount';
import OrderSummaryModal from './OrderSummaryModal';
import { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';

export interface OrderSummaryDrawerProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    additionalLineItems?: ReactNode;
}

const OrderSummaryDrawer: FunctionComponent<OrderSummaryDrawerProps & OrderSummarySubtotalsProps> = ({
    additionalLineItems,
    coupons,
    discountAmount,
    giftCertificates,
    handlingAmount,
    headerLink,
    lineItems,
    onRemovedCoupon,
    onRemovedGiftCertificate,
    shippingAmount,
    shopperCurrency,
    storeCreditAmount,
    storeCurrency,
    subtotalAmount,
    taxes,
    total,
}) => {
    const renderModal = useCallback(props => (
        <OrderSummaryModal
            { ...props }
            coupons={ coupons }
            discountAmount={ discountAmount }
            giftCertificates={ giftCertificates }
            handlingAmount={ handlingAmount }
            onRemovedCoupon={ onRemovedCoupon }
            onRemovedGiftCertificate={ onRemovedGiftCertificate }
            shippingAmount={ shippingAmount }
            storeCreditAmount={ storeCreditAmount }
            subtotalAmount={ subtotalAmount }
            taxes={ taxes }
            additionalLineItems={ additionalLineItems }
            headerLink={ headerLink }
            lineItems={ lineItems }
            shopperCurrency={ shopperCurrency }
            storeCurrency={ storeCurrency }
            total={ total }
        />
    ), [
        additionalLineItems,
        coupons,
        discountAmount,
        giftCertificates,
        handlingAmount,
        headerLink,
        lineItems,
        onRemovedCoupon,
        onRemovedGiftCertificate,
        shippingAmount,
        shopperCurrency,
        storeCreditAmount,
        storeCurrency,
        subtotalAmount,
        taxes,
        total,
    ]);

    return <ModalTrigger modal={ renderModal }>
        { ({ onClick }) => <div
            className="cartDrawer optimizedCheckout-orderSummary"
            onClick={ onClick }
        >
            <figure
                className={ classNames(
                    'cartDrawer-figure',
                    { 'cartDrawer-figure--stack': getLineItemsCount(lineItems) > 1 }
                ) }
            >
                <div className="cartDrawer-imageWrapper">
                    { getImage(lineItems) }
                </div>
            </figure>
            <div className="cartDrawer-body">
                <h3 className="cartDrawer-items optimizedCheckout-headingPrimary">
                    <TranslatedString
                        id="cart.item_count_text"
                        data={ { count: getItemsCount(lineItems) } }
                    />
                </h3>
                <a>
                    <TranslatedString id="cart.show_details_action" />
                </a>
            </div>
            <div className="cartDrawer-actions">
                <h3 className="cartDrawer-total optimizedCheckout-headingPrimary">
                    <ShopperCurrency amount={ total } />
                </h3>
            </div>
        </div> }
    </ModalTrigger>;
};

function getImage(lineItems: LineItemMap): ReactNode {
    const productWithImage = lineItems.physicalItems[0] || lineItems.digitalItems[0];

    if (productWithImage && productWithImage.imageUrl) {
        return <img
            alt={ productWithImage.name }
            data-test="cart-item-image"
            src={ productWithImage.imageUrl }
        />;
    }

    if (lineItems.giftCertificates.length) {
        return <IconGiftCertificate />;
    }
}

export default OrderSummaryDrawer;
