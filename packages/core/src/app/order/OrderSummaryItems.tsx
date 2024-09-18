import { LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';

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
}

interface OrderSummaryItemsState {
    isExpanded: boolean;
    collapsedLimit: number;
}

class OrderSummaryItems extends React.Component<OrderSummaryItemsProps, OrderSummaryItemsState> {
    constructor(props: OrderSummaryItemsProps) {
        super(props);

        this.state = {
            isExpanded: false,
            collapsedLimit: this.getCollapsedLimit(),
        };
    }

    render(): ReactNode {
        const { displayLineItemsCount = true, items } = this.props;
        const { collapsedLimit, isExpanded } = this.state;

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
                    {[
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
                    ]
                        .slice(0, isExpanded ? undefined : collapsedLimit)
                        .map((summaryItemProps) => (
                            <li className="productList-item is-visible" key={summaryItemProps.id}>
                                <OrderSummaryItem {...summaryItemProps} />
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
