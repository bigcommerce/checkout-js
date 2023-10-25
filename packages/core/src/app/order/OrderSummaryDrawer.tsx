import {
    LineItemMap,
    ShopperCurrency as ShopperCurrencyType,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, memo, ReactNode, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { ShopperCurrency } from '../currency';
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
    isUpdatedCartSummayModal?: boolean,
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    additionalLineItems?: ReactNode;
}

const OrderSummaryDrawer: FunctionComponent<
    OrderSummaryDrawerProps & OrderSummarySubtotalsProps
> = ({
    additionalLineItems,
    coupons,
    discountAmount,
    giftCertificates,
    handlingAmount,
    headerLink,
    isTaxIncluded,
    isUpdatedCartSummayModal,
    lineItems,
    onRemovedCoupon,
    onRemovedGiftCertificate,
    shippingAmount,
    shopperCurrency,
    storeCreditAmount,
    giftWrappingAmount,
    storeCurrency,
    subtotalAmount,
    taxes,
    total,
    fees,
}) => {
    const renderModal = useCallback(
        (props) => (
            <OrderSummaryModal
                {...props}
                additionalLineItems={additionalLineItems}
                coupons={coupons}
                discountAmount={discountAmount}
                fees={fees}
                giftCertificates={giftCertificates}
                giftWrappingAmount={giftWrappingAmount}
                handlingAmount={handlingAmount}
                headerLink={headerLink}
                isTaxIncluded={isTaxIncluded}
                isUpdatedCartSummayModal={isUpdatedCartSummayModal}
                lineItems={lineItems}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shippingAmount={shippingAmount}
                shopperCurrency={shopperCurrency}
                storeCreditAmount={storeCreditAmount}
                storeCurrency={storeCurrency}
                subtotalAmount={subtotalAmount}
                taxes={taxes}
                total={total}
            />
        ),
        [
            additionalLineItems,
            coupons,
            discountAmount,
            giftCertificates,
            handlingAmount,
            headerLink,
            isTaxIncluded,
            lineItems,
            onRemovedCoupon,
            onRemovedGiftCertificate,
            giftWrappingAmount,
            shippingAmount,
            shopperCurrency,
            storeCreditAmount,
            storeCurrency,
            subtotalAmount,
            taxes,
            total,
            fees,
        ],
    );

    return (
        <ModalTrigger modal={renderModal}>
            {({ onClick, onKeyPress }) => (
                <div
                    className="cartDrawer optimizedCheckout-orderSummary"
                    onClick={onClick}
                    onKeyPress={onKeyPress}
                    tabIndex={0}
                >
                    <figure
                        className={classNames('cartDrawer-figure', {
                            'cartDrawer-figure--stack': getLineItemsCount(lineItems) > 1,
                        })}
                    >
                        <div className="cartDrawer-imageWrapper">{getImage(lineItems)}</div>
                    </figure>
                    <div className="cartDrawer-body">
                        <h3 className="cartDrawer-items optimizedCheckout-headingPrimary">
                            <TranslatedString
                                data={{ count: getItemsCount(lineItems) }}
                                id="cart.item_count_text"
                            />
                        </h3>
                        <a>
                            <TranslatedString id="cart.show_details_action" />
                        </a>
                    </div>
                    <div className="cartDrawer-actions">
                        <h3 className="cartDrawer-total optimizedCheckout-headingPrimary">
                            <ShopperCurrency amount={total} />
                        </h3>
                    </div>
                </div>
            )}
        </ModalTrigger>
    );
};

function getImage(lineItems: LineItemMap): ReactNode {
    const productWithImage = lineItems.physicalItems[0] || lineItems.digitalItems[0];

    if (productWithImage && productWithImage.imageUrl) {
        return (
            <img
                alt={productWithImage.name}
                data-test="cart-item-image"
                src={productWithImage.imageUrl}
            />
        );
    }

    if (lineItems.giftCertificates.length) {
        return <IconGiftCertificate />;
    }
}

export default memo(OrderSummaryDrawer);
