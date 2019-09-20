import { LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { Fragment, ReactNode } from 'react';

import { TranslatedString } from '../locale';
import { IconChevronDown, IconChevronUp } from '../ui/icon';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';

const COLLAPSED_ITEMS_LIMIT = 4;

export interface OrderSummaryItemsProps {
    items: LineItemMap;
}

interface OrderSummaryItemsState {
    isExpanded: boolean;
}

class OrderSummaryItems extends React.Component<OrderSummaryItemsProps, OrderSummaryItemsState> {
    constructor(props: OrderSummaryItemsProps) {
        super(props);

        this.state = {
            isExpanded: false,
        };
    }

    render(): ReactNode {
        const { items } = this.props;
        const { isExpanded } = this.state;

        return (<Fragment>
            <h3
                className="cart-section-heading optimizedCheckout-contentPrimary"
                data-test="cart-count-total"
            >
                <TranslatedString
                    data={ { count: getItemsCount(items) } }
                    id="cart.item_count_text"
                />
            </h3>

            <ul aria-live="polite" className="productList">
                {
                    [
                        ...items.physicalItems
                            .slice()
                            .sort(item => item.variantId)
                            .map(mapFromPhysical),
                        ...items.giftCertificates
                            .slice()
                            .map(mapFromGiftCertificate),
                        ...items.digitalItems
                            .slice()
                            .sort(item => item.variantId)
                            .map(mapFromDigital),
                        ...(items.customItems || [])
                            .map(mapFromCustom),
                    ]
                        .slice(0, isExpanded ? undefined : COLLAPSED_ITEMS_LIMIT)
                        .map(summaryItemProps =>
                            <li
                                className="productList-item is-visible"
                                key={ summaryItemProps.id }
                            >
                                <OrderSummaryItem { ...summaryItemProps } />
                            </li>
                        )
                }
            </ul>

            { this.renderActions() }
        </Fragment>);
    }

    private renderActions(): ReactNode {
        const { isExpanded } = this.state;

        if (this.getLineItemCount() < 5) {
            return;
        }

        return (
            <div className="cart-actions">
                <button
                    className="button button--tertiary button--tiny optimizedCheckout-buttonSecondary"
                    onClick={ this.handleToggle }
                    type="button"
                >
                        { isExpanded ?
                            <Fragment>
                                <TranslatedString id="cart.see_less_action" />
                                <IconChevronUp />
                            </Fragment> :
                            <Fragment>
                                <TranslatedString id="cart.see_all_action" />
                                <IconChevronDown />
                            </Fragment> }
                </button>
            </div>
        );
    }

    private getLineItemCount(): number {
        const { items } = this.props;

        return (items.customItems || []).length +
            items.physicalItems.length +
            items.digitalItems.length +
            items.giftCertificates.length;
    }

    private handleToggle: () => void = () => {
        const { isExpanded } = this.state;

        this.setState({ isExpanded: !isExpanded });
    };
}

export default OrderSummaryItems;
