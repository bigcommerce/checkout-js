import { Checkout, Consignment, PhysicalItem } from '@bigcommerce/checkout-sdk';

const timeString = new Date().toISOString();

const physicalItem: PhysicalItem = {
    id: 'x',
    parentId: null,
    variantId: 71,
    productId: 103,
    sku: 'CLC',
    name: 'Item X',
    url: 'https://store.url/item-x/',
    quantity: 1,
    brand: 'OFS',
    isTaxable: true,
    imageUrl: 'https://image.url',
    discounts: [],
    discountAmount: 0,
    couponAmount: 0,
    retailPrice: 200,
    listPrice: 200,
    salePrice: 200,
    extendedListPrice: 200,
    extendedSalePrice: 200,
    comparisonPrice: 200,
    extendedComparisonPrice: 200,
    isShippingRequired: true,
    giftWrapping: undefined,
    addedByPromotion: false,
    options: [],
    categoryNames: ['Shop All', 'Utility'],
};

const shippingAddress1 = {
    firstName: 'First',
    lastName: 'Address',
    company: '',
    address1: '111 Testing Rd',
    address2: '',
    city: 'Cityville',
    stateOrProvince: 'State',
    stateOrProvinceCode: 'ST',
    country: 'Country',
    countryCode: 'CC',
    postalCode: '10000',
    phone: '0000000000',
    type: 'residential',
    customFields: [],
};

const shippingAddress2 = {
    firstName: 'Second',
    lastName: 'Address',
    company: '',
    address1: '222 Testing Rd',
    address2: '',
    city: 'Townsville',
    stateOrProvince: 'State',
    stateOrProvinceCode: 'ST',
    country: 'Country',
    countryCode: 'CC',
    postalCode: '20000',
    phone: '0000000001',
    type: 'residential',
    customFields: [],
};

const shippingAddress3 = {
    firstName: 'Third',
    lastName: 'Address',
    company: '',
    address1: '333 Testing Rd',
    address2: '',
    city: 'Villageburg',
    stateOrProvince: 'State',
    stateOrProvinceCode: 'ST',
    country: 'Country',
    countryCode: 'CC',
    postalCode: '30000',
    phone: '0000000002',
    type: 'residential',
    customFields: [],
};

const consignment: Consignment = {
    id: 'consignment-1',
    shippingCost: 0,
    handlingCost: 0,
    lineItemIds: ['x'],
    selectedShippingOption: {
        id: 'option-id-pick-up',
        type: 'shipping_pickupinstore',
        description: 'Pickup In Store',
        imageUrl: '',
        cost: 3,
        transitTime: '',
        additionalDescription: '',
        isRecommended: true,
    },
    shippingAddress: {
        ...shippingAddress1,
        shouldSaveAddress: true,
    },
    address: {
        ...shippingAddress1,
        shouldSaveAddress: true,
    },
    availableShippingOptions: [
        {
            id: 'option-id-pick-up',
            type: 'shipping_pickupinstore',
            description: 'Pickup In Store',
            imageUrl: '',
            cost: 3,
            transitTime: '',
            isRecommended: true,
            additionalDescription: '',
        },
        {
            id: 'option-id-flat-rate',
            type: 'shipping_flatrate',
            description: 'Flat Rate',
            imageUrl: '',
            cost: 10,
            transitTime: '',
            isRecommended: false,
            additionalDescription: '',
        },
    ],
};

const checkout: Checkout = {
    id: 'xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx',
    cart: {
        id: 'xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx',
        customerId: 0,
        email: '',
        currency: {
            name: 'US Dollar',
            code: 'USD',
            symbol: '$',
            decimalPlaces: 2,
        },
        isTaxIncluded: true,
        baseAmount: 200,
        discountAmount: 0,
        cartAmount: 200,
        coupons: [],
        discounts: [
            {
                id: 'x',
                discountedAmount: 0,
            },
        ],
        lineItems: {
            physicalItems: [physicalItem],
            digitalItems: [],
            giftCertificates: [],
            customItems: [],
        },
        createdTime: timeString,
        updatedTime: timeString,
    },
    consignments: [],
    orderId: undefined,
    shippingCostTotal: 0,
    shippingCostBeforeDiscount: 0,
    handlingCostTotal: 0,
    taxTotal: 18.18,
    giftWrappingCostTotal: 0,
    coupons: [],
    taxes: [
        {
            name: 'GST',
            amount: 18.18,
        },
    ],
    subtotal: 200,
    grandTotal: 200,
    outstandingBalance: 200,
    isStoreCreditApplied: true,
    shouldExecuteSpamCheck: false,
    giftCertificates: [],
    createdTime: timeString,
    updatedTime: timeString,
    customerMessage: '',
    channelId: 1,
    customer: {
        id: 0,
        isGuest: true,
        email: '',
        firstName: '',
        lastName: '',
        fullName: '',
        addresses: [],
        storeCredit: 0,
        shouldEncourageSignIn: false,
    },
    promotions: [],
    balanceDue: 200,
    discounts: [],
    fees: [],
};

const checkoutWithDigitalCart: Checkout = {
    ...checkout,
    cart: {
        ...checkout.cart,
        lineItems: {
            ...checkout.cart.lineItems,
            physicalItems: [],
        },
    },
};

const checkoutWithPromotions: Checkout = {
    ...checkout,
    promotions: [
        {
            banners: [
                { type: 'upsell', text: 'Get a discount if you order more' },
                { type: 'eligible', text: 'You are eligible for a discount' },
            ],
        },
    ],
};

const checkoutWithBillingEmail: Checkout = {
    ...checkout,
    billingAddress: {
        id: 'billing-address-id',
        firstName: '',
        lastName: '',
        email: 'test@example.com',
        company: '',
        address1: '',
        address2: '',
        city: '',
        shouldSaveAddress: false,
        stateOrProvince: '',
        stateOrProvinceCode: '',
        country: '',
        countryCode: '',
        postalCode: '',
        phone: '',
        customFields: [],
    },
};

const checkoutWithShipping: Checkout = {
    ...checkoutWithBillingEmail,
    consignments: [consignment],
};

const checkoutWithShippingAndBilling: Checkout = {
    ...checkoutWithShipping,
    billingAddress: {
        id: 'billing-address-id',
        firstName: 'checkout',
        lastName: 'test',
        email: 'test@example.com',
        company: '',
        address1: '130 Pitt St',
        address2: '',
        city: 'Sydney',
        shouldSaveAddress: true,
        stateOrProvince: 'New South Wales',
        stateOrProvinceCode: 'NSW',
        country: 'Australia',
        countryCode: 'AU',
        postalCode: '2000',
        phone: '',
        customFields: [],
    },
};

const checkoutWithCustomShippingAndBilling = {
    ...checkoutWithShippingAndBilling,
    consignments: [
        {
            ...checkoutWithShippingAndBilling.consignments[0],
            selectedShippingOption: {
                id: '',
                type: 'custom',
                description: 'Manual Order Custom Shipping Method',
                imageUrl: '',
                cost: 256,
                transitTime: '',
                additionalDescription: '',
            },
        },
    ],
};

const checkoutWithMultiShippingCart = {
    ...checkout,
    cart: {
        ...checkout.cart,
        lineItems: {
            ...checkout.cart.lineItems,
            physicalItems: [
                physicalItem,
                { ...physicalItem, id: 'y', quantity: 2, sku: 'CLC2', name: 'Item Y' },
                { ...physicalItem, id: 'z', quantity: 2, sku: 'CLC3', name: 'Item Z' },
            ],
        },
    },
    customer: {
        id: 1,
        isGuest: false,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        addresses: [
            {
                ...shippingAddress1,
                id: 1,
            },
            {
                id: 2,
                ...shippingAddress2,
            },
            {
                id: 3,
                ...shippingAddress3,
            },
        ],
        storeCredit: 0,
        shouldEncourageSignIn: true,
        customerGroup: {
            id: 1,
            name: 'Discount Group',
        },
    },
    consignment: [],
};

enum CheckoutPreset {
    CheckoutWithBillingEmail = 'CheckoutWithBillingEmail',
    CheckoutWithCustomShippingAndBilling = 'CheckoutWithCustomShippingAndBilling',
    CheckoutWithDigitalCart = 'CheckoutWithDigitalCart',
    CheckoutWithMultiShipping = 'CheckoutWithMultiShipping',
    CheckoutWithPromotions = 'CheckoutWithPromotions',
    CheckoutWithShipping = 'CheckoutWithShipping',
    CheckoutWithShippingAndBilling = 'CheckoutWithShippingAndBilling',
    CustomErrorFlashMessage = 'CustomErrorFlashMessage',
    ErrorFlashMessage = 'ErrorFlashMessage',
    UnsupportedProvider = 'UnsupportedProvider',
}

export {
    CheckoutPreset,
    checkout,
    checkoutWithBillingEmail,
    checkoutWithCustomShippingAndBilling,
    checkoutWithDigitalCart,
    checkoutWithMultiShippingCart,
    checkoutWithPromotions,
    checkoutWithShipping,
    checkoutWithShippingAndBilling,
    consignment,
    shippingAddress2,
    shippingAddress3,
};
