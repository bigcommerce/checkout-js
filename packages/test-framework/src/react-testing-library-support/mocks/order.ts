export const orderResponse = {
    data: {
        order: {
            orderId: 123,
            token: 'sample_token_1234567890',
            payment: {
                id: 'payment_method',
                gateway: null,
                status: 'PAYMENT_STATUS_PENDING',
                helpText: 'Payment instructions',
            },
            socialData: {},
            status: 'ORDER_STATUS_PENDING',
            customerCreated: false,
            hasDigitalItems: false,
            isDownloadable: false,
            isComplete: false,
            callbackUrl: 'https://example.com/callback-url',
            customerCanBeCreated: false,
            id: 123,
            items: [
                {
                    id: 1,
                    type: 'ItemPhysicalEntity',
                    name: 'Sample Item Name',
                    imageUrl: 'https://example.com/sample-image.jpg',
                    quantity: 1,
                    amount: 50.0,
                    discount: 0,
                    amountAfterDiscount: 50.0,
                    tax: 5.0,
                    attributes: [],
                    integerAmount: 5000,
                    integerDiscount: 0,
                    integerAmountAfterDiscount: 5000,
                    integerTax: 500,
                },
            ],
            currency: 'USD',
            subtotal: {
                amount: 50.0,
                integerAmount: 5000,
            },
            coupon: {
                discountedAmount: 0,
                coupons: [],
            },
            discount: {
                amount: 0,
                integerAmount: 0,
            },
            discountNotifications: [],
            giftCertificate: {
                totalDiscountedAmount: 0,
                appliedGiftCertificates: [],
            },
            shipping: {
                amount: 10.0,
                integerAmount: 1000,
                amountBeforeDiscount: 10.0,
                integerAmountBeforeDiscount: 1000,
                required: true,
            },
            storeCredit: {
                amount: 0,
            },
            taxSubtotal: {
                amount: 5.0,
                integerAmount: 500,
            },
            taxes: [
                {
                    name: 'Sample Tax',
                    amount: 5.0,
                },
            ],
            taxTotal: {
                amount: 5.0,
                integerAmount: 500,
            },
            handling: {
                amount: 2.0,
                integerAmount: 200,
            },
            grandTotal: {
                amount: 67.0,
                integerAmount: 6700,
            },
        },
    },
    meta: {
        deviceFingerprint: null,
    },
};
