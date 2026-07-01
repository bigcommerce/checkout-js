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
import {
    buildBundleItemsMapFromOrder,
    removeAndBundleItemsTogether,
    removeBundledItems,
} from './removeBundledItems';

// Module-scoped to survive the responsive remount. Safe as MobileView mounts only one instance at a time.
let backorderDetailsExpanded = false;

const getBackorderDetailsExpanded = (): boolean => backorderDetailsExpanded;

export const setBackorderDetailsExpanded = (value: boolean): void => {
    backorderDetailsExpanded = value;
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
    isMobileCartModal?: boolean;
}

const SummaryHeading = ({
    displayLineItemsCount,
    nonBundledItems,
    showBackorderDetails,
    showBackorderSwitch,
    toggleBackorderDetails,
}: {
    displayLineItemsCount: boolean;
    nonBundledItems: LineItemMap;
    showBackorderDetails: boolean;
    showBackorderSwitch: boolean;
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
        {showBackorderSwitch && (
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
    onSwitch,
}: {
    isExpanded: boolean;
    onSwitch(): void;
}): ReactElement => (
    <div className="cart-actions">
        <button
            className="button button--tertiary button--tiny optimizedCheckout-buttonSecondary sub-text-medium"
            onClick={onSwitch}
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
    isMobileCartModal = false,
}: OrderSummaryItemsProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBackorderDetails, setShowBackorderDetails] = useState(getBackorderDetailsExpanded);
    const {
        selectedState: { config, order },
    } = useCheckout(({ data }) => ({
        config: data.getConfig(),
        order: data.getOrder(),
    }));

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

    // On the mobile cart modal, bundle children are not rendered while the bundle experiment is
    // off, so gate the backorder toggle behind the experiment there to stop it appearing when
    // only hidden bundle children are backordered.
    const showBackorderSwitch =
        shouldDisplayBackorderDetails &&
        backorderCount > 0 &&
        (!isMobileCartModal || pickListExperimentEnabled);

    // Only expand line-item backorder details when the toggle is actually available; otherwise the
    // persisted (module-scoped) selection could expand details on a surface where the toggle is
    // hidden (e.g. the mobile cart modal with the bundle experiment off).
    const expandBackorderDetails = showBackorderSwitch && showBackorderDetails;

    const { nonBundledItems, bundleItemsMap } = pickListExperimentEnabled
        ? order?.bundledItems
            ? buildBundleItemsMapFromOrder(items, order.bundledItems)
            : removeAndBundleItemsTogether(items)
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
    const handleSwitch = () => setIsExpanded(!isExpanded);

    return (
        <>
            {(displayLineItemsCount || showBackorderSwitch) && (
                <SummaryHeading
                    displayLineItemsCount={displayLineItemsCount}
                    nonBundledItems={nonBundledItems}
                    showBackorderDetails={showBackorderDetails}
                    showBackorderSwitch={showBackorderSwitch}
                    toggleBackorderDetails={toggleBackorderDetails}
                />
            )}
            <ProductList
                bundleItemsMap={bundleItemsMap}
                collapsedLimit={collapsedLimit}
                isExpanded={isExpanded}
                items={nonBundledItems}
                pickListExperimentEnabled={pickListExperimentEnabled}
                showBackorderDetails={expandBackorderDetails}
            />

            {shouldShowActions && <CartActions isExpanded={isExpanded} onSwitch={handleSwitch} />}
        </>
    );
};

export default OrderSummaryItems;
