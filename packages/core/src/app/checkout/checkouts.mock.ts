import { type Checkout, type CheckoutPayment } from '@bigcommerce/checkout-sdk';

import { getCart } from '../cart/carts.mock';
import { getCoupon } from '../coupon/utils/coupons.mock';
import { getGuestCustomer } from '../customer/customers.mock';

export function getCheckout(): Checkout {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        cart: getCart(),
        customer: getGuestCustomer(),
        customerMessage: 'comment',
        billingAddress: undefined,
        consignments: [],
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        discounts: [],
        isStoreCreditApplied: false,
        coupons: [getCoupon()],
        orderId: 295,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        shouldExecuteSpamCheck: false,
        handlingCostTotal: 8,
        taxTotal: 3,
        subtotal: 190,
        grandTotal: 190,
        giftWrappingCostTotal: 0,
        outstandingBalance: 190,
        giftCertificates: [],
        balanceDue: 0,
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
        promotions: [],
        channelId: 123456,
        displayDiscountTotal: 0,
        manualDiscountTotal: 0,
        orderBasedAutoDiscountTotal: 0,
        comparisonShippingCost: 20,
        fees: [],
    };
}

export function getCheckoutWithPayments(providerId?: string): Checkout {
    return {
        ...getCheckout(),
        payments: [getCheckoutPayment(providerId)],
    };
}

export function getCheckoutPayment(providerId?: string): CheckoutPayment {
    return {
        providerId: providerId || 'amazonpay',
        gatewayId: undefined,
        providerType: 'PAYMENT_TYPE_HOSTED',
        detail: {
            step: 'ACKNOWLEDGE',
        },
    };
}
