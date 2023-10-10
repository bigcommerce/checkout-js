import {
    CustomItem,
    DigitalItem,
    GiftCertificateItem,
    PhysicalItem,
} from '@bigcommerce/checkout-sdk';

export function getCustomItem(): CustomItem {
    return {
        id: '55e11c8f-7dce-4da3-9413-b649533f8bad',
        listPrice: 10,
        extendedListPrice: 20,
        name: 'Custom item',
        quantity: 2,
        sku: 'custom-sku',
    };
}

export function getPhysicalItem(): PhysicalItem {
    return {
        id: '666',
        variantId: 71,
        productId: 103,
        sku: 'CLC',
        name: 'Canvas Laundry Cart',
        url: '/canvas-laundry-cart/',
        quantity: 1,
        brand: 'OFS',
        isTaxable: true,
        imageUrl: '/images/canvas-laundry-cart.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 200,
        comparisonPrice: 200,
        extendedListPrice: 200,
        extendedSalePrice: 200,
        extendedComparisonPrice: 250,
        isShippingRequired: true,
        addedByPromotion: false,
        options: [
            {
                name: 'n',
                nameId: 1,
                value: 'v',
                valueId: 3,
            },
        ],
        categoryNames: ['Cat 1'],
        retailPrice: 1,
    };
}

export function getDigitalItem(): DigitalItem {
    return {
        id: '667',
        variantId: 72,
        productId: 104,
        sku: 'CLX',
        name: 'Digital Book',
        url: '/digital-book/',
        quantity: 1,
        brand: 'Digitalia',
        isTaxable: true,
        imageUrl: '/images/digital-book.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 100,
        salePrice: 100,
        comparisonPrice: 200,
        downloadPageUrl: 'url.php',
        downloadFileUrls: [],
        downloadSize: '',
        extendedListPrice: 200,
        extendedSalePrice: 200,
        extendedComparisonPrice: 250,
        addedByPromotion: false,
        options: [
            {
                name: 'm',
                nameId: 2,
                value: 'l',
                valueId: 4,
            },
        ],
        categoryNames: ['Ebooks', 'Audio Books'],
        retailPrice: 1,
    };
}

export function getGiftCertificateItem(): GiftCertificateItem {
    return {
        id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
        name: '$100 Gift Certificate',
        message: 'message',
        amount: 100,
        taxable: false,
        theme: 'General',
        sender: {
            name: 'pablo',
            email: 'pa@blo.com',
        },
        recipient: {
            name: 'luis',
            email: 'lu@is.com',
        },
    };
}

export function getPicklistItem(): PhysicalItem[] {
    return [
        {
            id: '666',
            variantId: 71,
            productId: 103,
            sku: 'CLC',
            name: 'Canvas Laundry Cart',
            url: '/canvas-laundry-cart/',
            quantity: 1,
            brand: 'OFS',
            isTaxable: true,
            imageUrl: '/images/canvas-laundry-cart.jpg',
            discounts: [],
            discountAmount: 0,
            couponAmount: 0,
            listPrice: 200,
            salePrice: 200,
            comparisonPrice: 200,
            extendedListPrice: 200,
            extendedSalePrice: 200,
            extendedComparisonPrice: 250,
            isShippingRequired: true,
            addedByPromotion: false,
            options: [
                {
                    name: 'n',
                    nameId: 1,
                    value: 'v',
                    valueId: 3,
                },
            ],
            categoryNames: ['Cat 1'],
            retailPrice: 1,
        },
        {
            id: '777',
            variantId: 72,
            productId: 104,
            sku: 'BLB',
            name: 'Bamboo Laundry Basket',
            url: '/bamboo-laundry-basket/',
            quantity: 1,
            brand: 'OFS',
            isTaxable: true,
            imageUrl: '/images/bamboo-laundry-basket.jpg',
            discounts: [],
            discountAmount: 0,
            couponAmount: 0,
            listPrice: 100,
            salePrice: 100,
            comparisonPrice: 100,
            extendedListPrice: 100,
            extendedSalePrice: 100,
            extendedComparisonPrice: 150,
            isShippingRequired: true,
            addedByPromotion: false,
            categoryNames: ['Cat 1'],
            parentId: '666',
            retailPrice: 1,
        },
    ];
}
