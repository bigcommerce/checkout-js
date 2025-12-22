import {
    type GatewayOrderPayment,
    type GiftCertificateOrderPayment,
    type Order,
    type OrderFee,
    type OrderPayment,
    type OrderShippingConsignment,
} from '@bigcommerce/checkout-sdk';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getGiftCertificateItem, getPhysicalItem } from '../cart/lineItem.mock';
import { getCoupon, getShippingCoupon } from '../coupon/utils/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';

export function getOrder(): Order {
    return {
        baseAmount: 200,
        billingAddress: getBillingAddress(),
        cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        channelId: 1,
        consignments: {
            shipping: [],
        },
        coupons: [getCoupon(), getShippingCoupon()],
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
            physicalItems: [getPhysicalItem()],
            digitalItems: [],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [],
        },
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        giftWrappingCostTotal: 0,
        taxTotal: 3,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        orderAmount: 190,
        orderAmountAsInteger: 19000,
        orderId: 295,
        payments: [getGatewayOrderPayment(), getGiftCertificateOrderPayment()],
        fees: [],
    };
}

export function getOrderWithMandateId(): Order {
    const order = getOrder();

    order.payments = [getGatewayOrderPaymentWithMandateId(), getGiftCertificateOrderPayment()];

    return order;
}

export function getOrderWithMandateURL(): Order {
    const order = getOrder();

    order.payments = [getGatewayOrderPaymentWithMandateURL(), getGiftCertificateOrderPayment()];

    return order;
}

const mockOrderShippingConsignment: OrderShippingConsignment = {
    lineItems: [
        { id: 101 },
        { id: 102 },
    ],
    shippingAddressId: 2001,
    firstName: "John",
    lastName: "Doe",
    company: "Tech Solutions",
    address1: "123 Main St",
    address2: "Apt 4B",
    city: "Sydney",
    stateOrProvince: "NSW",
    postalCode: "2000",
    country: "Australia",
    countryCode: "AU",
    email: "john.doe@example.com",
    phone: "+61 400 123 456",
    itemsTotal: 2,
    itemsShipped: 2,
    shippingMethod: "Express Shipping",
    baseCost: 20.00,
    costExTax: 18.18,
    costIncTax: 20.00,
    costTax: 1.82,
    costTaxClassId: 1,
    baseHandlingCost: 5.00,
    handlingCostExTax: 4.55,
    handlingCostIncTax: 5.00,
    handlingCostTax: 0.45,
    handlingCostTaxClassId: 1,
    shippingZoneId: 101,
    shippingZoneName: "Australia - NSW",
    customFields: [],
    discounts: [],
};

export function getOrderWithShippingDiscount(): Order {
    return {
        ...getOrder(),
        consignments: {
            shipping: [
                { ...mockOrderShippingConsignment, discounts: [{ id: 1, amount: 2, code: 'coupon-shipping-discount', }, { id: 2, amount: 2, code: null, }] },
                { ...mockOrderShippingConsignment, discounts: [{ id: 1, amount: 3, code: 'coupon-shipping-discount', }, { id: 2, amount: 3, code: null, }, { id: 3, amount: 3, code: null, }] },
            ]
        },
        coupons: [getShippingCoupon()],
        shippingCostTotal: 10,
        shippingCostBeforeDiscount: 20,
        payments: [getGatewayOrderPayment()],
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

export function getGatewayOrderPaymentWithMandateId(): GatewayOrderPayment {
    return {
        providerId: 'checkoutcom',
        description: 'SEPA Direct Debit (via Checkout.com)',
        amount: 190,
        methodId: 'sepa',
        detail: {
            step: 'FINALIZE',
            instructions: '<strong>295</strong> something',
        },
        mandate: {
            id: 'ABC12345',
        },
    };
}

export function getGatewayOrderPaymentWithMandateURL(): GatewayOrderPayment {
    return {
        providerId: 'checkoutcom',
        description: 'SEPA Direct Debit (via Checkout.com)',
        amount: 190,
        methodId: 'sepa',
        detail: {
            step: 'FINALIZE',
            instructions: '<strong>295</strong> something',
        },
        mandate: {
            id: '',
            url: 'https://www.test.com/mandate',
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

export function getOrderFee(): OrderFee {
    return {
        id: 1,
        cost: 2.0,
        type: 'custom_fee',
        source: 'somewhere',
        customerDisplayName: 'display name for customer',
    }
}
