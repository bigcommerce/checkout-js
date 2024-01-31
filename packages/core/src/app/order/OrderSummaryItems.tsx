import { LineItemMap, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { getVariantsDataFromItems } from '../common/utility/getCraftData';
import { IconChevronDown, IconChevronUp } from '../ui/icon';
import { isSmallScreen } from '../ui/responsive';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem, { OrderSummaryItemProps } from './OrderSummaryItem';

const COLLAPSED_ITEMS_LIMIT = 4;
const COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN = 3;

export interface OrderSummaryItemsProps {
    displayLineItemsCount: boolean;
    items: LineItemMap;
    currency: StoreCurrency;
}

interface OrderSummaryItemsState {
    isExpanded: boolean;
    itemsWithCraftData: OrderSummaryItemProps[];
    craftDataLoading: boolean;
    collapsedLimit: number;
}

const getCraftData = async (items: OrderSummaryItemProps[], currencyCode: string, callback: (arg0: OrderSummaryItemProps[]) => void) => {
    const variants = await getVariantsDataFromItems(items, currencyCode);

    const updatedItemsWithCraftData = items.map((item: any) => {
        const updatedItem = item;
        const {sku} = item;

        const store = currencyCode === "USD" ? "usa" : "global";

        updatedItem.craftData = variants.data.find((variantData) => {
            if(!variantData) return false;

            const {globalVariantSku, usaVariantSku} = variantData.variant;

            return (store === "global" && globalVariantSku?.toLowerCase() === sku?.toLowerCase()) || (store === "usa" && usaVariantSku?.toLowerCase() === sku?.toLowerCase());
        })?.variant;

        return updatedItem;
    });

    // update state
    callback(updatedItemsWithCraftData);
}

class OrderSummaryItems extends React.Component<OrderSummaryItemsProps, OrderSummaryItemsState> {
    constructor(props: OrderSummaryItemsProps) {
        super(props);

        const {items, currency} = props;
        const initialItems: OrderSummaryItemProps[] = [
            ...items.physicalItems
                .slice()
                .sort((item) => item.variantId)
                .map(mapFromPhysical),
            ...items.giftCertificates.slice().map(mapFromGiftCertificate),
            ...items.digitalItems
                .slice()
                .sort((item) => item.variantId)
                .map(mapFromDigital),
            ...(items.customItems || []).map(mapFromCustom),
        ];

        getCraftData(initialItems, currency.code, (updatedItems) => {
            this.setState({
                itemsWithCraftData: updatedItems,
                craftDataLoading: false
            });
        })

        this.state = {
            isExpanded: false,
            itemsWithCraftData: initialItems,
            craftDataLoading: true,
            collapsedLimit: this.getCollapsedLimit(),
        };
    }

    render(): ReactNode {
        const { displayLineItemsCount = true, items, currency } = this.props;
        const { collapsedLimit, isExpanded, itemsWithCraftData } = this.state;

        return (
            <>
                {displayLineItemsCount && <h3
                    className="cart-section-heading optimizedCheckout-contentPrimary"
                    data-test="cart-count-total"
                >
                    <TranslatedString
                        data={{ count: getItemsCount(items) }}
                        id="cart.item_count_text"
                    />
                </h3>}

                <ul aria-live="polite" className="productList">
                    {itemsWithCraftData
                        .slice(0, isExpanded ? undefined : collapsedLimit)
                        .map((summaryItemProps) => (
                            <li className="productList-item is-visible" key={summaryItemProps.id}>
                                <OrderSummaryItem {...summaryItemProps} craftDataLoading={this.state.craftDataLoading} currencyCode={currency.code} />
                            </li>
                        ))}
                </ul>

                {this.renderActions()}
            </>
        );
    }

    private getCollapsedLimit(): number {
        return isSmallScreen() ? COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN : COLLAPSED_ITEMS_LIMIT;
    }

    private renderActions(): ReactNode {
        const { isExpanded } = this.state;

        if (this.getLineItemCount() <= this.getCollapsedLimit()) {
            return;
        }

        return (
            <div className="cart-actions">
                <button
                    className="button button--tertiary button--tiny optimizedCheckout-buttonSecondary"
                    onClick={this.handleToggle}
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
    }

    private getLineItemCount(): number {
        const { items } = this.props;

        return (
            (items.customItems || []).length +
            items.physicalItems.length +
            items.digitalItems.length +
            items.giftCertificates.length
        );
    }

    private handleToggle: () => void = () => {
        const { isExpanded } = this.state;

        this.setState({ isExpanded: !isExpanded });
    };
}

export default OrderSummaryItems;
