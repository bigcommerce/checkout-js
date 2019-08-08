import { ShippingOption } from '@bigcommerce/checkout-sdk';

export function getShippingOption(): ShippingOption {
    return {
        description: 'Flat Rate',
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        imageUrl: '',
        isRecommended: true,
        cost: 0,
        transitTime: '',
        type: 'shipping_flatrate',
    };
}

export function getShippingOptionPickUpStore(): ShippingOption {
    return {
        description: 'Pick Up in Store',
        id: '1:61d4bb52f746477e1d4fb411221318c3',
        imageUrl: '',
        isRecommended: false,
        cost: 0,
        transitTime: '',
        type: 'shipping_pickupinstore',
    };
}
