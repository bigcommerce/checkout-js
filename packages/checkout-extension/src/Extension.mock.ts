import { Extension, ExtensionRegion } from '@bigcommerce/checkout-sdk';

export function getExtensions(): Extension[] {
    return [
        {
            id: '123',
            name: 'Foo',
            region: ExtensionRegion.ShippingShippingAddressFormBefore,
            url: 'https://widget.foo.com/',
        },
        {
            id: '456',
            name: 'Bar',
            region: ExtensionRegion.ShippingShippingAddressFormAfter,
            url: 'https://widget.bar.com/',
        },
    ];
}
