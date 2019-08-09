import { noop } from 'lodash';

export default function navigateToOrderConfirmation(): Promise<never> {
    const url = `${window.location.href}/order-confirmation`;

    window.location.replace(url);

    return new Promise(noop);
}
