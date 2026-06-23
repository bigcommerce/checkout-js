import { type DigitalItem, type LineItemMap, type PhysicalItem } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, {
    type FunctionComponent,
    type ReactElement,
    type ReactNode,
    useCallback,
    useRef,
    useState,
} from 'react';
import { TransitionGroup } from 'react-transition-group';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    CollapseCSSTransition,
    IconChevronDown,
    IconChevronUp,
    isSmallScreen,
    Switch,
} from '@bigcommerce/checkout/ui';

import { isExperimentEnabled } from '../common/utility';

import getBackorderCount from './getBackorderCount';
import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';
import { removeAndBundleItemsTogether, removeBundledItems } from './removeBundledItems';

// The backorder-details toggle must survive the responsive remount (desktop/mobile
// breakpoint swap unmounts and remounts the order summary subtree) and stay consistent
// between the desktop and mobile instances. Because <MobileView> renders mutually
// exclusive subtrees, only one OrderSummaryItems is mounted at a time, so a module-scoped
// value written on toggle and read on mount is sufficient. It re-initializes to OFF on a
// full page reload, which matches the requirement of persisting across resize only.
let backorderDetailsExpanded = false;

const getBackorderDetailsExpanded = (): boolean => backorderDetailsExpanded;

const setBackorderDetailsExpanded = (value: boolean): void => {
    backorderDetailsExpanded = value;
};

export const resetBackorderDetailsExpanded = (): void => {
    setBackorderDetailsExpanded(false);
};

interface AnimatedProductItemProps {
    children: ReactNode;
    in?: boolean;
    onExited?: () => void;
}

const AnimatedProductItem: FunctionComponent<AnimatedProductItemProps> = ({
    children,
    in: inProp,
    onExited,
}) => {
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

const SummaryHeading = ({
    displayLineItemsCount,
    nonBundledItems,
    showBackorderDetails,
    showBackorderToggle,
    toggleBackorderDetails,
}: {
    displayLineItemsCount: boolean;
    nonBundledItems: LineItemMap;
    showBackorderDetails: boolean;
    showBackorderToggle: boolean;
    toggleBackorderDetails(): void;
}): ReactElement => (
    <div
        className={classNames('cart-section-heading-container', {
            'cart-section-heading-container--switch-only': !displayLineItemsCount,
        })}
    >
        {displayLineItemsCount && (
            <h3
                className="cart-section-heading optimizedCheckout-contentPrimary body-medium"
                data-test="cart-count-total"
            >
                <TranslatedString
                    data={{ count: getItemsCount(nonBundledItems) }}
                    id="cart.item_count_text"
                />
            </h3>
        )}
        {showBackorderToggle && (
            <Switch
                checked={showBackorderDetails}
                label={<TranslatedString id="cart.backorder_details" />}
                onChange={toggleBackorderDetails}
                testId="cart-backorder-link"
            />
        )}
    </div>
);

const ProductList = ({
    items,
    isExpanded,
    collapsedLimit,
    showBackorderDetails,
    bundleItemsMap,
    pickListExperimentEnabled,
}: {
    items: LineItemMap;
    isExpanded: boolean;
    collapsedLimit: number;
    showBackorderDetails: boolean;
    bundleItemsMap?: Map<string | number, Array<PhysicalItem | DigitalItem>>;
    pickListExperimentEnabled?: boolean;
}): ReactElement => {
    const summaryItems = [
        ...items.physicalItems
            .slice()
            .sort((item) => item.variantId)
            .map((item) => mapFromPhysical(item, bundleItemsMap, pickListExperimentEnabled)),
        ...items.giftCertificates.slice().map(mapFromGiftCertificate),
        ...items.digitalItems
            .slice()
            .sort((item) => item.variantId)
            .map((item) => mapFromDigital(item, bundleItemsMap, pickListExperimentEnabled)),
        ...(items.customItems || []).map(mapFromCustom),
    ].slice(0, isExpanded ? undefined : collapsedLimit);

    return (
        <TransitionGroup aria-live="polite" className="productList" component="ul">
            {summaryItems.map((summaryItemProps) => (
                <AnimatedProductItem key={summaryItemProps.id}>
                    <OrderSummaryItem
                        orderItem={summaryItemProps}
                        shouldExpandBackorderDetails={showBackorderDetails}
                    />
                </AnimatedProductItem>
            ))}
        </TransitionGroup>
    );
};

const CartActions = ({
    isExpanded,
    onToggle,
}: {
    isExpanded: boolean;
    onToggle(): void;
}): ReactElement => (
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
    const [showBackorderDetails, setShowBackorderDetails] = useState(getBackorderDetailsExpanded);
    const { selectedState: config } = useCheckout(({ data }) => data.getConfig());

    const toggleBackorderDetails = useCallback(() => {
        setShowBackorderDetails((prev) => {
            const next = !prev;

            setBackorderDetailsExpanded(next);

            return next;
        });
    }, []);

    const backorderCount = getBackorderCount(items);
    const shouldDisplayBackorderDetails =
        !!config?.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront &&
        (!!config?.inventorySettings?.showQuantityOnBackorder ||
            !!config?.inventorySettings?.showBackorderMessage);
    const pickListExperimentEnabled = config
        ? isExperimentEnabled(config.checkoutSettings, 'BACK-425.update_bundle_item_ux', false)
        : false;

    // The item-count heading is hidden only in the mobile cart modal, where bundle children are
    // not rendered while the bundle experiment is off. Gate the backorder toggle behind the
    // experiment there so it can't appear when only hidden bundle children are backordered.
    const showBackorderToggle =
        shouldDisplayBackorderDetails &&
        backorderCount > 0 &&
        (displayLineItemsCount || pickListExperimentEnabled);

    const { nonBundledItems, bundleItemsMap } = pickListExperimentEnabled
        ? removeAndBundleItemsTogether(items)
        : { nonBundledItems: removeBundledItems(items), bundleItemsMap: undefined };

    const collapsedLimit = isSmallScreen()
        ? COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN
        : COLLAPSED_ITEMS_LIMIT;
    const getLineItemCount = useCallback(
        () =>
            (nonBundledItems.customItems || []).length +
            nonBundledItems.physicalItems.length +
            nonBundledItems.digitalItems.length +
            nonBundledItems.giftCertificates.length,
        [nonBundledItems],
    );
    const shouldShowActions = getLineItemCount() > collapsedLimit;
    const handleToggle = () => setIsExpanded(!isExpanded);

    return (
        <>
            {(displayLineItemsCount || showBackorderToggle) && (
                <SummaryHeading
                    displayLineItemsCount={displayLineItemsCount}
                    nonBundledItems={nonBundledItems}
                    showBackorderDetails={showBackorderDetails}
                    showBackorderToggle={showBackorderToggle}
                    toggleBackorderDetails={toggleBackorderDetails}
                />
            )}
            <ProductList
                bundleItemsMap={bundleItemsMap}
                collapsedLimit={collapsedLimit}
                isExpanded={isExpanded}
                items={nonBundledItems}
                pickListExperimentEnabled={pickListExperimentEnabled}
                showBackorderDetails={showBackorderDetails}
            />

            {shouldShowActions && <CartActions isExpanded={isExpanded} onToggle={handleToggle} />}
        </>
    );
};

export default OrderSummaryItems;
