import { noop } from 'lodash';

import { isBuyNowCart } from '../common/utility';

export default function navigateToOrderConfirmation(location = window.location, orderId?: number): Promise<never> {
    let url: string;

    if (orderId && isBuyNowCart()) {
        url = `/checkout/order-confirmation/${orderId.toString()}`;
    } else {
        url = `${location.pathname.replace(/\/$/, '')}/order-confirmation`;
    }

    location.replace(url);

    return new Promise(noop);
}
