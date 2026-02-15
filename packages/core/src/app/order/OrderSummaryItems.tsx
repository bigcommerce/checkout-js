import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, useCallback, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconChevronDown, IconChevronUp } from '../ui/icon';
import { isSmallScreen } from '../ui/responsive';

import getBackorderCount from './getBackorderCount';
import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';
import removeBundledItems from './removeBundledItems';

const COLLAPSED_ITEMS_LIMIT = 4;
const COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN = 3;

export interface OrderSummaryItemsProps {
    displayLineItemsCount: boolean;
    items: LineItemMap;
}

const ItemCount = ({ items, nonBundledItems }: { items: LineItemMap; nonBundledItems: LineItemMap }): ReactElement => {
    const backorderCount = getBackorderCount(items);
    const { checkoutState } = useCheckout();
    const config = checkoutState.data.getConfig();
    const shouldDisplayBackorderMessages = config?.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront;

    return (
        <h3
            className="cart-section-heading optimizedCheckout-contentPrimary body-medium"
            data-test="cart-count-total"
        >
            <TranslatedString data={{ count: getItemsCount(nonBundledItems) }} id="cart.item_count_text" />
            {shouldDisplayBackorderMessages && backorderCount > 0 && (
                <a
                    className="cart-backorder-link"
                    data-test="cart-backorder-total"
                    href="#"
                    onClick={preventDefault()}
                >
                    <TranslatedString data={{ count: backorderCount }} id="cart.backorder_count_text" />
                </a>
            )}
        </h3>
    );
};

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

const CartActions = ({ isExpanded, onToggle }: { isExpanded: boolean; onToggle(): void; }): ReactElement => (
    <div className="cart-actions">
        <button
            className="button button--tertiary button--tiny optimizedCheckout-buttonSecondary sub-text-medium"
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
}: OrderSummaryItemsProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);
    const nonBundledItems = removeBundledItems(items);

    const collapsedLimit = isSmallScreen() ? COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN : COLLAPSED_ITEMS_LIMIT;
    const getLineItemCount = useCallback(
        () =>
            ((nonBundledItems.customItems || []).length +
                nonBundledItems.physicalItems.length +
                nonBundledItems.digitalItems.length +
                nonBundledItems.giftCertificates.length),
        [nonBundledItems]
    );
    const shouldShowActions = getLineItemCount() > collapsedLimit;
    const handleToggle = () => setIsExpanded(!isExpanded);

    return (
        <>
            {displayLineItemsCount && <ItemCount items={items} nonBundledItems={nonBundledItems} />}

            <ProductList collapsedLimit={collapsedLimit} isExpanded={isExpanded} items={nonBundledItems} />

            {shouldShowActions && <CartActions isExpanded={isExpanded} onToggle={handleToggle} />}
        </>
    );
};

export default OrderSummaryItems;
