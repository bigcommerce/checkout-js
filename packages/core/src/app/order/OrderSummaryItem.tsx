import classNames from 'classnames';
import { isNumber } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { ShopperCurrency } from '../currency';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface OrderSummaryItemProps {
    id: string | number;
    amount: number;
    quantity: number;
    name: string;
    amountAfterDiscount?: number;
    image?: ReactNode;
    description?: ReactNode;
    productOptions?: OrderSummaryItemOption[];
}

export interface OrderSummaryItemOption {
    testId: string;
    content: ReactNode;
}

const customDescription = {
    PURE: 'Combats cell stress for boosted energy, faster recovery from exercise and better aging.',
    PURE_TRIPLE_PACK: 'Valued at $X. Feel re-energized and refreshed with three months of cellular health.',
    JOINT: 'Supports post exercise recovery, joint health and mobility.',
    HEART: 'Supports heart and blood vessel function for optimal cardiovascular health.',
    BLOOD_SUGAR: 'Helps maintain normal blood sugar levels and insulin levels.',
    LIVER: 'Supports optimal liver function and your body’s natural detox process.',
    CURCUMIN: 'Supports immune system, digestion, mental clarity and post-workout recovery.',
    EYE: 'Supports eyes, vision and blue light filtration.',
    BRAIN: 'Supports brain health, mental clarity and focus.',
    PROTECT: 'Protects and repairs, supports normal skin pigmentation, skin elasticity and wrinkle management.',
    HYDRATE: 'Supports hydrated, luminous skin and an evenly toned complexion.'
};
const getCustomDescription = (name: string, amount: number, currencyService: any) => {

    name = name.toLowerCase();
    if (name.indexOf('eye') !== -1) {
        return customDescription['EYE'];
    } else if (name.indexOf('liver') !== -1) {
        return customDescription['LIVER'];
    } else if (name.indexOf('pure triple') !== -1) {
        return customDescription['PURE_TRIPLE_PACK'].replace('$X', currencyService.toCustomerCurrency(amount / 0.9));
    } else if (name.indexOf('pure') !== -1) {
        return customDescription['PURE'];
    } else if (name.indexOf('joint') !== -1) {
        return customDescription['JOINT'];
    } else if (name.indexOf('heart') !== -1) {
        return customDescription['HEART'];
    } else if (name.indexOf('blood') !== -1) {
        return customDescription['BLOOD_SUGAR'];
    } else if (name.indexOf('curcumin') !== -1) {
        return customDescription['CURCUMIN'];
    } else if (name.indexOf('brain') !== -1) {
        return customDescription['BRAIN'];
    } else if (name.indexOf('derma +hydrate') !== -1) {
        return customDescription['HYDRATE'];
    } else if (name.indexOf('derma +protect') !== -1) {
        return customDescription['PROTECT'];
    }
    return '';
};
const OrderSummaryItem: FunctionComponent<OrderSummaryItemProps & WithCurrencyProps> = ({
    amount,
    amountAfterDiscount,
    image,
    name,
    productOptions,
    quantity,
    description,
    currency
}) => {
    const isSubscription = () => {
        return productOptions && productOptions[0] && productOptions[0].content
            && (productOptions[0].content.toString().indexOf('sends every') !== -1
                || productOptions[0].content.toString().indexOf('send every') !== -1);
    };
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
                        { (productOptions || []).map((option, index) =>
                            <li
                                className="product-option"
                                data-test={ option.testId }
                                key={ index }
                            >
                                { option.content }
                            </li>
                        ) }
                        <li className="product-option custom-description">{ getCustomDescription(name, amount, currency) }</li>
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
                            { 'product-price--beforeDiscount': isNumber(amountAfterDiscount) && amountAfterDiscount !== amount }
                        ) }
                        data-test="cart-item-product-price"
                    >
                        <ShopperCurrency amount={ amount } />
                    </div>

                    { isNumber(amountAfterDiscount) && amountAfterDiscount !== amount && <div
                        className="product-price"
                        data-test="cart-item-product-price--afterDiscount"
                    >
                        <ShopperCurrency amount={ amountAfterDiscount } />
                    </div> }
                </div>
            </div>
            { isSubscription() && <div className="subscription-info 30-days">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.666748 11.3334V6.66667H5.33341L3.18875 8.81333C3.92872 9.57001 4.94172 9.9976 6.00008 10C7.69305 9.9975 9.20109 8.92948 9.76541 7.33333H9.77741C9.85378 7.11641 9.91154 6.89338 9.95008 6.66667H11.2914C10.9555 9.33327 8.68776 11.3332 6.00008 11.3334H5.99341C4.57926 11.3376 3.22219 10.7758 2.22475 9.77333L0.666748 11.3334ZM2.04941 5.33333H0.708081C1.04391 2.66774 3.31008 0.668094 5.99675 0.666638H6.00008C7.4145 0.662112 8.77189 1.22389 9.76941 2.22667L11.3334 0.666638V5.33333H6.66675L8.81475 3.18667C8.07401 2.4291 7.05961 2.00143 6.00008 2C4.30712 2.0025 2.79907 3.07052 2.23475 4.66667H2.22275C2.14579 4.8834 2.08801 5.10648 2.05008 5.33333H2.04941Z" fill="white"/>
                </svg>
                Subscription option (sends every 30 days)*
            </div>
            }
            { !isSubscription() &&
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
