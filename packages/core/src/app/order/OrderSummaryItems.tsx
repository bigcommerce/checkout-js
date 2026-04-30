import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, type ReactElement, type ReactNode, useCallback, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CollapseCSSTransition, IconChevronDown, IconChevronUp } from '@bigcommerce/checkout/ui';

import { isSmallScreen } from '../ui/responsive';

import getBackorderCount from './getBackorderCount';
import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';
import removeBundledItems from './removeBundledItems';

interface AnimatedProductItemProps {
    children: ReactNode;
    in?: boolean;
    onExited?: () => void;
}

const AnimatedProductItem: FunctionComponent<AnimatedProductItemProps> = ({ children, in: inProp, onExited }) => {
    const nodeRef = useRef<HTMLLIElement>(null);

    return (
        <CollapseCSSTransition
            classNames="product-item"
            in={inProp}
            isSlideAnimation
            nodeRef={nodeRef}
            onExited={onExited}
        >
            <li className="productList-item is-visible" ref={nodeRef}>
                {children}
            </li>
        </CollapseCSSTransition>
    );
};

const COLLAPSED_ITEMS_LIMIT = 4;
const COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN = 3;

export interface OrderSummaryItemsProps {
    displayLineItemsCount: boolean;
    items: LineItemMap;
}

const ItemCount = (
    { items, nonBundledItems, showBackorderDetails, setShowBackorderDetails }:
    { 
        items: LineItemMap;
        nonBundledItems: LineItemMap;
        setShowBackorderDetails: React.Dispatch<React.SetStateAction<boolean>>;
        showBackorderDetails: boolean;
    }
): ReactElement => {
    const { checkoutState } = useCheckout();
    const backorderCount = getBackorderCount(items);
    const config = checkoutState.data.getConfig();
    const shouldDisplayBackorderDetails = 
        !!config?.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront &&
        (!!config?.inventorySettings?.showQuantityOnBackorder || !!config?.inventorySettings?.showBackorderMessage);

    return (
        <h3
            className="cart-section-heading optimizedCheckout-contentPrimary body-medium"
            data-test="cart-count-total"
        >
            <TranslatedString data={{ count: getItemsCount(nonBundledItems) }} id="cart.item_count_text" />
            {shouldDisplayBackorderDetails && backorderCount > 0 && (
                <a
                    className="cart-backorder-link"
                    data-test="cart-backorder-link"
                    href="#"
                    onClick={preventDefault(() => setShowBackorderDetails(prev => !prev))}
                >
                    {showBackorderDetails && <>
                        <TranslatedString id="cart.hide_backorder_details" />
                        <IconChevronUp />
                    </>}
                    {!showBackorderDetails && <>
                        <TranslatedString id="cart.show_backorder_details" />
                        <IconChevronDown />
                    </>}
                </a>
            )}
        </h3>
    );
};

const ProductList = ({ items, isExpanded, collapsedLimit, showBackorderDetails }: { items: LineItemMap; isExpanded: boolean; collapsedLimit: number; showBackorderDetails: boolean }): ReactElement => {
    const summaryItems = [
        ...items.physicalItems.slice().sort((item) => item.variantId).map(item => mapFromPhysical(item)),
        ...items.giftCertificates.slice().map(mapFromGiftCertificate),
        ...items.digitalItems.slice().sort((item) => item.variantId).map(mapFromDigital),
        ...(items.customItems || []).map(mapFromCustom),
    ].slice(0, isExpanded ? undefined : collapsedLimit);

    return (
        <TransitionGroup aria-live="polite" className="productList" component="ul">
            {summaryItems.map(summaryItemProps => (
                <AnimatedProductItem key={summaryItemProps.id}>
                    <OrderSummaryItem orderItem={summaryItemProps} shouldExpandBackorderDetails={showBackorderDetails} />
                </AnimatedProductItem>
            ))}
        </TransitionGroup>
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
    const [showBackorderDetails, setShowBackorderDetails] = useState(false);
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
            {displayLineItemsCount &&
                <ItemCount
                    items={items}
                    nonBundledItems={nonBundledItems}
                    setShowBackorderDetails={setShowBackorderDetails}
                    showBackorderDetails={showBackorderDetails}
                />}
            <ProductList collapsedLimit={collapsedLimit} isExpanded={isExpanded} items={nonBundledItems} showBackorderDetails={showBackorderDetails} />

            {shouldShowActions && <CartActions isExpanded={isExpanded} onToggle={handleToggle} />}
        </>
    );
};

export default OrderSummaryItems;
