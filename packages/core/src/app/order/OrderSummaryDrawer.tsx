import {
    type LineItemMap,
    type ShopperCurrency as ShopperCurrencyType,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, memo, type ReactNode, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconGiftCertificate, ModalTrigger } from '@bigcommerce/checkout/ui';

import { type OrderSummarySubtotalsProps } from '../coupon';
import { ShopperCurrency } from '../currency';

import getItemsCount from './getItemsCount';
import getLineItemsCount from './getLineItemsCount';
import OrderSummaryModal from './OrderSummaryModal';
import { removeBundledItems } from './removeBundledItems';

export interface OrderSummaryDrawerProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
}

const OrderSummaryDrawer: FunctionComponent<
    OrderSummaryDrawerProps & OrderSummarySubtotalsProps
> = ({
    handlingAmount,
    headerLink,
    isTaxIncluded,
    lineItems,
    shopperCurrency,
    storeCreditAmount,
    giftWrappingAmount,
    storeCurrency,
    taxes,
    total,
    fees,
}) => {
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);

    const renderModal = useCallback(
        (props: any) => (
            <OrderSummaryModal
                {...props}
                fees={fees}
                giftWrappingAmount={giftWrappingAmount}
                handlingAmount={handlingAmount}
                headerLink={headerLink}
                isTaxIncluded={isTaxIncluded}
                items={lineItems}
                shopperCurrency={shopperCurrency}
                storeCreditAmount={storeCreditAmount}
                storeCurrency={storeCurrency}
                taxes={taxes}
                total={total}
            />
        ),
        [
            handlingAmount,
            headerLink,
            isTaxIncluded,
            lineItems,
            giftWrappingAmount,
            shopperCurrency,
            storeCreditAmount,
            storeCurrency,
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
                            'cartDrawer-figure--stack': getLineItemsCount(nonBundledLineItems) > 1,
                        })}
                    >
                        <div className="cartDrawer-imageWrapper">
                            {getImage(nonBundledLineItems)}
                        </div>
                    </figure>
                    <div className="cartDrawer-body">
                        <h3 className="cartDrawer-items optimizedCheckout-headingPrimary">
                            <TranslatedString
                                data={{ count: getItemsCount(nonBundledLineItems) }}
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
