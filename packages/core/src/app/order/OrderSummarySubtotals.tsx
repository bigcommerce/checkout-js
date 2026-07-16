import {
    type Coupon,
    type Fee,
    type GiftCertificate,
    type OrderFee,
    type Tax,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import isOrderFee from './isOrderFee';
import OrderSummaryDiscount from './OrderSummaryDiscount';
import OrderSummaryPrice from './OrderSummaryPrice';

// SMust match SURCHARGE_FEE_NAME in the SDK surcharge handler.
const SURCHARGE_FEE_NAME = 'corporate_card_surcharge';

const isSurchargeFee = (fee: Fee | OrderFee): boolean =>
    'name' in fee && fee.name === SURCHARGE_FEE_NAME;

export interface OrderSummarySubtotalsProps {
    coupons: Coupon[];
    giftCertificates?: GiftCertificate[];
    discountAmount?: number;
    isTaxIncluded?: boolean;
    taxes?: Tax[];
    fees?: Fee[] | OrderFee[];
    giftWrappingAmount?: number;
    shippingAmount?: number;
    shippingAmountBeforeDiscount?: number;
    handlingAmount?: number;
    storeCreditAmount?: number;
    subtotalAmount: number;
    onRemovedGiftCertificate?(code: string): void;
    onRemovedCoupon?(code: string): void;
}

const OrderSummarySubtotals: FunctionComponent<OrderSummarySubtotalsProps> = ({
    discountAmount,
    isTaxIncluded,
    giftCertificates,
    taxes,
    fees,
    giftWrappingAmount,
    shippingAmount,
    shippingAmountBeforeDiscount,
    subtotalAmount,
    handlingAmount,
    storeCreditAmount,
    coupons,
    onRemovedGiftCertificate,
    onRemovedCoupon,
}) => {
    // Surcharging: render the surcharge as its own labelled row, alongside shipping /
    // handling; keep other fees in the generic loop below.
    // NOTE: the surcharge fee comes from the BE Fees API (Checkout.fees). Until that endpoint
    // is implemented on the BE, no surcharge fee is present, so this row simply won't render.
    const surchargeFee = (fees ?? []).find(isSurchargeFee);
    const otherFees = (fees ?? []).filter((fee) => !isSurchargeFee(fee)) as typeof fees;

    return (
        <>
            <OrderSummaryPrice
                amount={subtotalAmount}
                className="cart-priceItem--subtotal"
                label={<TranslatedString id="cart.subtotal_text" />}
                testId="cart-subtotal"
            />

            {(coupons || []).map((coupon, index) => (
                <OrderSummaryDiscount
                    amount={coupon.discountedAmount}
                    code={coupon.code}
                    key={index}
                    label={coupon.displayName}
                    onRemoved={onRemovedCoupon}
                    testId="cart-coupon"
                />
            ))}

            {!!discountAmount && (
                <OrderSummaryDiscount
                    amount={discountAmount}
                    label={<TranslatedString id="cart.discount_text" />}
                    testId="cart-discount"
                />
            )}

            {(giftCertificates || []).map((giftCertificate, index) => (
                <OrderSummaryDiscount
                    amount={giftCertificate.used}
                    code={giftCertificate.code}
                    key={index}
                    label={<TranslatedString id="cart.gift_certificate_text" />}
                    onRemoved={onRemovedGiftCertificate}
                    remaining={giftCertificate.remaining}
                    testId="cart-gift-certificate"
                />
            ))}

            {!!giftWrappingAmount && (
                <OrderSummaryPrice
                    amount={giftWrappingAmount}
                    label={<TranslatedString id="cart.gift_wrapping_text" />}
                    testId="cart-gift-wrapping"
                />
            )}

            <OrderSummaryPrice
                amount={shippingAmount}
                amountBeforeDiscount={shippingAmountBeforeDiscount}
                label={<TranslatedString id="cart.shipping_text" />}
                testId="cart-shipping"
                zeroLabel={<TranslatedString id="cart.free_text" />}
            />

            {!!handlingAmount && (
                <OrderSummaryPrice
                    amount={handlingAmount}
                    label={<TranslatedString id="cart.handling_text" />}
                    testId="cart-handling"
                />
            )}

            {/* Surcharge placeholder — shown once applied in-flight. */}
            {!!surchargeFee && (
                <OrderSummaryPrice
                    amount={surchargeFee.cost}
                    label={<TranslatedString id="cart.surcharge_text" />}
                    testId="cart-surcharge"
                />
            )}

            {otherFees?.map((fee, index) => (
                <OrderSummaryPrice
                    amount={fee.cost}
                    key={index}
                    label={isOrderFee(fee) ? fee.customerDisplayName : fee.displayName}
                    testId="cart-fees"
                />
            ))}

            {!isTaxIncluded &&
                (taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}

            {!!storeCreditAmount && (
                <OrderSummaryDiscount
                    amount={storeCreditAmount}
                    label={<TranslatedString id="cart.store_credit_text" />}
                    testId="cart-store-credit"
                />
            )}
        </>
    );
};

export default memo(OrderSummarySubtotals);
