import { noop } from 'lodash';

import { isBuyNowCart } from '../common/utility';

export default function navigateToOrderConfirmation(
    isBuyNowCartEnabled = false,
    orderId?: number,
): Promise<never> {
    let url: string;

    if (isBuyNowCartEnabled) {
        if (orderId && isBuyNowCart()) {
            url = `/checkout/order-confirmation/${orderId.toString()}`;
        } else {
            url = `${window.location.pathname.replace(/\/$/, '')}/order-confirmation`;
        }

        window.location.replace(url);

        return new Promise(noop);
    }

    url = `${window.location.pathname.replace(/\/$/, '')}/order-confirmation`;
    window.location.replace(url);

    return new Promise(noop);
}
