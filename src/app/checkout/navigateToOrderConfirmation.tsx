import { noop } from 'lodash';

export default function navigateToOrderConfirmation(location = window.location): Promise<never> {
    const url = `/${location.pathname.includes('embedded-checkout') ? 'embedded-checkout' : 'checkout'}/order-confirmation`;

    location.replace(url);

    return new Promise(noop);
}
