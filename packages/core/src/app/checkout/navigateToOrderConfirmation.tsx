import { noop } from 'lodash';

import { isBuyNowCart } from '../common/utility';

export default function navigateToOrderConfirmation(
    orderId?: number,
): Promise<never> {
    let url: string;

    if (orderId && isBuyNowCart()) {
        url = `/checkout/order-confirmation/${orderId.toString()}`;
    } else {
        url = `${window.location.pathname.replace(/\/$/, '')}/order-confirmation`;
    }

    window.location.replace(url);

    return new Promise(noop);
}
