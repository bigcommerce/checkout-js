import { noop } from 'lodash';

export default function navigateToOrderConfirmation(location = window.location): Promise<never> {
    const url = `${location.pathname.replace(/\/$/, '')}/order-confirmation`;

    location.replace(url);

    return new Promise(noop);
}
