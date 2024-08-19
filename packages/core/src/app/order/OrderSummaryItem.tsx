import classNames from 'classnames';
import { isNumber } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useEffect, useMemo, useState } from 'react';

import { withCurrency, WithCurrencyProps } from '@bigcommerce/checkout/locale';

import { checkIsSubscription, VARIANT_TYPES, VariantAttributes } from '../common/utility/getCraftData';
import { ShopperCurrency } from '../currency';

export interface OrderSummaryItemProps {
    id: string | number;
    productId?: number;
    amount: number;
    quantity: number;
    name: string;
    amountAfterDiscount?: number;
    image?: ReactNode;
    description?: ReactNode;
    productOptions?: OrderSummaryItemOption[];
    craftData?: {
        variant: VariantAttributes & {type: VARIANT_TYPES};
        defaultVariant: VariantAttributes & { type: VARIANT_TYPES };
        bigCommerceProduct: any;
        bigCommercePricing: any;
    }
    sku?: string;
}

export interface OrderSummaryItemOption {
    testId: string;
    content: ReactNode;
}

const getBasePrice = (item: OrderSummaryItemProps & WithCurrencyProps & {craftDataLoading: boolean; currencyCode: string}) => {
    if (!item.craftData) {
        return item.amount;
    }

    const {
        variant: {supplyValue},
        defaultVariant: {supplyValue: productDefaultSupplyValue},
        bigCommercePricing: {price: {as_entered: productDefaultPricing}}
    } =  item.craftData;
    const quantity = item.quantity;
    const markedUpPriceAmount = ((productDefaultPricing || 0) * (supplyValue || 1)) /
    (productDefaultSupplyValue || 1);
    const basePrice = markedUpPriceAmount * quantity;

    return basePrice;
}

const OrderSummaryItem: FunctionComponent<OrderSummaryItemProps & WithCurrencyProps & {craftDataLoading: boolean; currencyCode: string}> = (item) => {
    const {
        amountAfterDiscount,
        image,
        name,
        productOptions,
        quantity,
        description,
        craftData,
        craftDataLoading,
        currencyCode
    } = item;

    const [isSubscription, setIsSubscription] = useState(false);
    const [isSubscriptionLoaded, setIsSubscriptionLoaded] = useState(false);

    const basePriceAmount = useMemo(() => (getBasePrice(item)), [item]);

    useEffect(() => {
        const calculateCheckIsSubscription = async () => {
            const returnedCheck = await checkIsSubscription(item, currencyCode);

            setIsSubscription(returnedCheck);
            setIsSubscriptionLoaded(true);
        };
        
        calculateCheckIsSubscription();
    }, [item, currencyCode]);

    return (
        <>
            <div className="product" data-test="cart-item">
                <figure className="product-column product-figure">
                    { image }
                </figure>

                <div className="product-column product-body">
                    <h5
                        className="product-title optimizedCheckout-contentPrimary"
                        data-test="cart-item-product-title"
                    >
                        { `${quantity} x ${name}` }
                    </h5>
                    <ul
                        className="product-options optimizedCheckout-contentSecondary"
                        data-test="cart-item-product-options"
                    >
                        { (productOptions || []).map((option: any, index: number) =>
                            <li
                                className="product-option"
                                data-test={ option.testId }
                                key={ index }
                            >
                                { option.content }
                            </li>
                        ) }
                        <li className={`product-option custom-description ${craftDataLoading ? "loading" : ""}`}>
                            { craftDataLoading ? (<><span /><span /><span /></>) : craftData?.variant?.checkoutDescription }
                        </li>
                    </ul>
                    { description && <div
                        className="product-description optimizedCheckout-contentSecondary"
                        data-test="cart-item-product-description"
                    >
                        { description }
                    </div> }
                </div>

                <div className="product-column product-actions">
                    <div
                        className={ classNames(
                            'product-price',
                            'optimizedCheckout-contentPrimary',
                            { 'product-price--beforeDiscount': isNumber(amountAfterDiscount) && amountAfterDiscount !== basePriceAmount }
                        ) }
                        data-test="cart-item-product-price"
                    >
                        <ShopperCurrency amount={ basePriceAmount } />
                    </div>

                    { isNumber(amountAfterDiscount) && amountAfterDiscount !== basePriceAmount && <div
                        className="product-price"
                        data-test="cart-item-product-price--afterDiscount"
                    >
                        <ShopperCurrency amount={ amountAfterDiscount } />
                    </div> }
                </div>
            </div>
            { isSubscriptionLoaded && isSubscription && <div className="subscription-info 30-days">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.666748 11.3334V6.66667H5.33341L3.18875 8.81333C3.92872 9.57001 4.94172 9.9976 6.00008 10C7.69305 9.9975 9.20109 8.92948 9.76541 7.33333H9.77741C9.85378 7.11641 9.91154 6.89338 9.95008 6.66667H11.2914C10.9555 9.33327 8.68776 11.3332 6.00008 11.3334H5.99341C4.57926 11.3376 3.22219 10.7758 2.22475 9.77333L0.666748 11.3334ZM2.04941 5.33333H0.708081C1.04391 2.66774 3.31008 0.668094 5.99675 0.666638H6.00008C7.4145 0.662112 8.77189 1.22389 9.76941 2.22667L11.3334 0.666638V5.33333H6.66675L8.81475 3.18667C8.07401 2.4291 7.05961 2.00143 6.00008 2C4.30712 2.0025 2.79907 3.07052 2.23475 4.66667H2.22275C2.14579 4.8834 2.08801 5.10648 2.05008 5.33333H2.04941Z" fill="white"/>
                </svg>
                Subscription option.{!craftDataLoading && <> {craftData?.variant?.sendFrequency}*</>}
            </div>
            }
            { isSubscriptionLoaded && !isSubscription &&
                <div className="subscription-info one-time">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.66659 9.66666H0.333252V8.33333H9.66659V9.66666ZM3.66659 6.61333L0.999919 3.94666L1.93992 3.00666L3.66659 4.72666L8.05992 0.333328L8.99992 1.27999L3.66659 6.61333Z" fill="white"/>
                    </svg>
                    One time purchase option
                </div>
            }
        </>
    );
};

export default withCurrency(memo(OrderSummaryItem));
