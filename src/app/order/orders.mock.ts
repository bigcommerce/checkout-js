import { GatewayOrderPayment, GiftCertificateOrderPayment, Order, OrderPayment } from '@bigcommerce/checkout-sdk';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getGiftCertificateItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getCoupon, getShippingCoupon } from '../coupon/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';

export function getOrder(): Order {
    return {
        baseAmount: 200,
        billingAddress: getBillingAddress(),
        cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        coupons: [
            getCoupon(),
            getShippingCoupon(),
        ],
        currency: getCurrency(),
        customerMessage: '',
        customerCanBeCreated: true,
        customerId: 0,
        discountAmount: 10,
        hasDigitalItems: false,
        isComplete: true,
        status: 'ORDER_STATUS_AWAITING_FULFILLMENT',
        isDownloadable: false,
        isTaxIncluded: false,
        lineItems: {
            physicalItems: [
                getPhysicalItem(),
            ],
            digitalItems: [],
            giftCertificates: [
                getGiftCertificateItem(),
            ],
            customItems: [],
        },
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        taxTotal: 3,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        orderAmount: 190,
        orderAmountAsInteger: 19000,
        orderId: 295,
        payments: [
            getGatewayOrderPayment(),
            getGiftCertificateOrderPayment(),
        ],
    };
}

export function getGatewayOrderPayment(): GatewayOrderPayment {
    return {
        providerId: 'authorizenet',
        description: 'credit-card',
        amount: 190,
        detail: {
            step: 'FINALIZE',
            instructions: '<strong>295</strong> something',
        },
    };
}

export function getStoreCreditPayment(): OrderPayment {
    return {
        providerId: 'storecredit',
        description: 'sc',
        amount: 60,
    };
}

export function getGiftCertificateOrderPayment(): GiftCertificateOrderPayment {
    return {
        providerId: 'giftcertificate',
        description: 'gc',
        amount: 7,
        detail: {
            code: 'gc',
            remaining: 3,
        },
    };
}
