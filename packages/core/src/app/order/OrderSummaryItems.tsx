import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, type ReactElement, type ReactNode, useCallback, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconChevronDown, IconChevronUp } from '../ui/icon';
import { isSmallScreen } from '../ui/responsive';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';

// Animation constants - matching coupon animations
const ANIMATION_DURATION = 300;
const SLIDE_DISTANCE = 12;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface AnimatedProductItemProps {
    children: ReactNode;
    in?: boolean;
}

const AnimatedProductItem: FunctionComponent<AnimatedProductItemProps> = ({ children, in: inProp }) => {
    const nodeRef = useRef<HTMLLIElement>(null);

    const handleEnter = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;

        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
        node.style.overflow = 'hidden';
    };

    const handleEntering = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;

        void node.offsetHeight;
        node.style.height = `${node.scrollHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
    };

    const handleEntered = () => {
        const node = nodeRef.current;
        if (!node) return;

        node.style.height = '';
        node.style.opacity = '';
        node.style.transform = '';
        node.style.overflow = '';
    };

    const handleExit = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;

        node.style.height = `${node.offsetHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
        node.style.overflow = 'hidden';
    };

    const handleExiting = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;

        void node.offsetHeight;
        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
    };

    return (
        <CSSTransition
            appear
            classNames="product-item"
            in={inProp}
            nodeRef={nodeRef}
            onEnter={handleEnter}
            onEntered={handleEntered}
            onEntering={handleEntering}
            onExit={handleExit}
            onExiting={handleExiting}
            timeout={ANIMATION_DURATION}
        >
            <li className="productList-item is-visible" ref={nodeRef}>
                {children}
            </li>
        </CSSTransition>
    );
};

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
        <TransitionGroup aria-live="polite" className="productList" component="ul">
            {summaryItems.map(summaryItemProps => (
                <AnimatedProductItem key={summaryItemProps.id}>
                    <OrderSummaryItem {...summaryItemProps} />
                </AnimatedProductItem>
            ))}
        </TransitionGroup>
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
