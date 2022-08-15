import { LineItemOption } from '@bigcommerce/checkout-sdk';

import { getDigitalItem } from '../cart/lineItem.mock';

import mapFromDigital from './mapFromDigital';

describe('mapFromDigital()', () => {
    it('returns downloadable related properties when it has a download URL', () => {
        const { options, ...item } = getDigitalItem();
        const { productOptions = [] } = mapFromDigital(item);

        expect(productOptions[0].testId).toBe('cart-item-digital-product-download');

        expect(productOptions[0].content).toMatchSnapshot();
    });

    it('returns digital related properties when it has no download URL', () => {
        const item = {
            ...getDigitalItem(),
            options: [] as LineItemOption[],
            downloadPageUrl: '',
        };
        const { productOptions = [] } = mapFromDigital(item);

        expect(productOptions[0].testId).toBe('cart-item-digital-product');

        expect(productOptions[0].content).toMatchSnapshot();
    });
});
