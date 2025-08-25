import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type ReactElement, useCallback, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconChevronDown, IconChevronUp } from '../ui/icon';
import { isSmallScreen } from '../ui/responsive';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';

const COLLAPSED_ITEMS_LIMIT = 4;
const COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN = 3;

export interface OrderSummaryItemsProps {
    displayLineItemsCount: boolean;
    items: LineItemMap;
    themeV2?: boolean;
}

const ItemCount = ({ items, themeV2 }: { items: LineItemMap; themeV2: boolean }): ReactElement => (
    <h3
        className={classNames('cart-section-heading optimizedCheckout-contentPrimary', { 'body-medium': themeV2 })}
        data-test="cart-count-total"
    >
        <TranslatedString data={{ count: getItemsCount(items) }} id="cart.item_count_text" />
    </h3>
);

const ProductList = ({ items, isExpanded, collapsedLimit }: { items: LineItemMap; isExpanded: boolean; collapsedLimit: number }): ReactElement => {
    const summaryItems = [
        ...items.physicalItems.slice().sort((item) => item.variantId).map(mapFromPhysical),
        ...items.giftCertificates.slice().map(mapFromGiftCertificate),
        ...items.digitalItems.slice().sort((item) => item.variantId).map(mapFromDigital),
        ...(items.customItems || []).map(mapFromCustom),
    ].slice(0, isExpanded ? undefined : collapsedLimit);

    return (
        <ul aria-live="polite" className="productList">
            {summaryItems.map(summaryItemProps => (
                <li className="productList-item is-visible" key={summaryItemProps.id}>
                    <OrderSummaryItem {...summaryItemProps} />
                </li>
            ))}
        </ul>
    );
};

const CartActions = ({ isExpanded, onToggle, themeV2 }: { isExpanded: boolean; onToggle(): void; themeV2: boolean }): ReactElement => (
    <div className="cart-actions">
        <button
            className={classNames('button button--tertiary button--tiny optimizedCheckout-buttonSecondary', { 'sub-text-medium': themeV2 })}
            onClick={onToggle}
            type="button"
        >
            {isExpanded ? (
                <>
                    <TranslatedString id="cart.see_less_action" />
                    <IconChevronUp />
                </>
            ) : (
                <>
                    <TranslatedString id="cart.see_all_action" />
                    <IconChevronDown />
                </>
            )}
        </button>
    </div>
);

const OrderSummaryItems = ({
    displayLineItemsCount = true,
    items,
    themeV2 = false,
}: OrderSummaryItemsProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);

    const collapsedLimit = isSmallScreen() ? COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN : COLLAPSED_ITEMS_LIMIT;
    const getLineItemCount = useCallback(
        () =>
            ((items.customItems || []).length +
                items.physicalItems.length +
                items.digitalItems.length +
                items.giftCertificates.length),
        [items]
    );
    const shouldShowActions = getLineItemCount() > collapsedLimit;
    const handleToggle = () => setIsExpanded(!isExpanded);

    return (
        <>
            {displayLineItemsCount && <ItemCount items={items} themeV2={themeV2} />}

            <ProductList collapsedLimit={collapsedLimit} isExpanded={isExpanded} items={items} />

            {shouldShowActions && <CartActions isExpanded={isExpanded} onToggle={handleToggle} themeV2={themeV2} />}
        </>
    );
};

export default OrderSummaryItems;
