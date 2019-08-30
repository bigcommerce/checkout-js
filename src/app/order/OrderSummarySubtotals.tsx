import { Coupon, GiftCertificate, Tax } from '@bigcommerce/checkout-sdk';
import React, { memo, Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';

import OrderSummaryDiscount from './OrderSummaryDiscount';
import OrderSummaryPrice from './OrderSummaryPrice';

export interface OrderSummarySubtotalsProps {
    coupons: Coupon[];
    giftCertificates?: GiftCertificate[];
    discountAmount?: number;
    taxes?: Tax[];
    shippingAmount?: number;
    handlingAmount?: number;
    storeCreditAmount?: number;
    subtotalAmount: number;
    onRemovedGiftCertificate?(code: string): void;
    onRemovedCoupon?(code: string): void;
}

const OrderSummarySubtotals: FunctionComponent<OrderSummarySubtotalsProps> = ({
    discountAmount,
    giftCertificates,
    taxes,
    shippingAmount,
    subtotalAmount,
    handlingAmount,
    storeCreditAmount,
    coupons,
    onRemovedGiftCertificate,
    onRemovedCoupon,
}) => {
    return (<Fragment>
        <OrderSummaryPrice
            testId="cart-subtotal"
            className="cart-priceItem--subtotal"
            label={ <TranslatedString id="cart.subtotal_text"/> }
            amount={ subtotalAmount }
        />

        { (coupons || [])
            .map((coupon, index) =>
                <OrderSummaryDiscount
                    onRemoved={ onRemovedCoupon }
                    key={ index }
                    testId="cart-coupon"
                    label={ coupon.displayName }
                    code={ coupon.code }
                    amount={ coupon.discountedAmount }
                />
        ) }

        { !!discountAmount && <OrderSummaryDiscount
            testId="cart-discount"
            label={ <TranslatedString id="cart.discount_text"/> }
            amount={ discountAmount }
        /> }

        { (giftCertificates || [])
            .map((giftCertificate, index) =>
                <OrderSummaryDiscount
                    onRemoved={ onRemovedGiftCertificate }
                    key={ index }
                    testId="cart-gift-certificate"
                    label={ <TranslatedString id="cart.gift_certificate_text"/> }
                    code={ giftCertificate.code }
                    amount={ giftCertificate.used }
                    remaining={ giftCertificate.remaining }
                />
        ) }

        <OrderSummaryPrice
            testId="cart-shipping"
            label={ <TranslatedString id="cart.shipping_text"/> }
            zeroLabel={ <TranslatedString id="cart.free_text"/> }
            amount={ shippingAmount }
        />

        { !!handlingAmount && <OrderSummaryPrice
            testId="cart-handling"
            label={ <TranslatedString id="cart.handling_text"/> }
            amount={ handlingAmount }
        /> }

        { (taxes || [])
            .map((tax, index) =>
                <OrderSummaryPrice
                    key={ index }
                    testId="cart-taxes"
                    label={ tax.name }
                    amount={ tax.amount }
                />
         ) }

        { !!storeCreditAmount && <OrderSummaryDiscount
            testId="cart-store-credit"
            label={ <TranslatedString id="cart.store_credit_text"/> }
            amount={ storeCreditAmount }
        /> }
    </Fragment>);
};

export default memo(OrderSummarySubtotals);
