import { LineItemMap, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';

import getProductsCheckoutDescriptions, { isSubscription } from '../common/utility/getProductsCheckoutDescriptions';
import { TranslatedString } from '../locale';
import { IconChevronDown, IconChevronUp } from '../ui/icon';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem, { OrderSummaryItemProps } from './OrderSummaryItem';

const COLLAPSED_ITEMS_LIMIT = 4;

export interface OrderSummaryItemsProps {
    items: LineItemMap;
    currency: StoreCurrency;
}

interface OrderSummaryItemsState {
    isExpanded: boolean;
    itemsWithCheckoutDescriptions: OrderSummaryItemProps[];
}

const getCheckoutDescriptions = async (items: OrderSummaryItemProps[], currencyCode: string) => {
    const oneTimePurchaseItems: number[] = [];
    const subscriptionItems: number[] =[]

    items.forEach((item) => {
        if(item.productId) {
            if(isSubscription(item)) {
                subscriptionItems.push(item.productId);
            } else {
                oneTimePurchaseItems.push(item.productId);
            }
        }
    })

    const productsDescriptionsForSubscriptions = await getProductsCheckoutDescriptions(subscriptionItems, currencyCode, "subscription");
    const productsDescriptionsForOneTimePurchases = await getProductsCheckoutDescriptions(oneTimePurchaseItems, currencyCode, "one-time-purchase");
    
    const updatedItemsWithCheckoutDescriptions = items.map((item: any) => {
        const updatedItem = item;
        const {productId} = item;
        const isSubscription = true;

        if(isSubscription) {
            const checkoutDescriptionSubscription = productsDescriptionsForSubscriptions.data.find(({id}) => id === productId.toString());
            
            updatedItem.checkoutDescription = checkoutDescriptionSubscription?.checkoutDescription || null;
        } else {
            const checkoutDescriptionOneTimePurchase = productsDescriptionsForOneTimePurchases.data.find(({id}) => id === productId.toString());
            
            updatedItem.checkoutDescription = checkoutDescriptionOneTimePurchase?.checkoutDescription || null;
        }

        return updatedItem;
    });

    // update state


    console.log("productsDescriptions", productsDescriptionsForSubscriptions, updatedItemsWithCheckoutDescriptions);
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

        getCheckoutDescriptions(initialItems, currency.code)

        this.state = {
            isExpanded: false,
            itemsWithCheckoutDescriptions: initialItems
        };
    }

    render(): ReactNode {
        const { items } = this.props;
        const { isExpanded, itemsWithCheckoutDescriptions } = this.state;

        return (
            <>
                <h3
                    className="cart-section-heading optimizedCheckout-contentPrimary"
                    data-test="cart-count-total"
                >
                    <TranslatedString
                        data={{ count: getItemsCount(items) }}
                        id="cart.item_count_text"
                    />
                </h3>

                <ul aria-live="polite" className="productList">
                    {itemsWithCheckoutDescriptions
                        .slice(0, isExpanded ? undefined : COLLAPSED_ITEMS_LIMIT)
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

    private renderActions(): ReactNode {
        const { isExpanded } = this.state;

        if (this.getLineItemCount() < 5) {
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
