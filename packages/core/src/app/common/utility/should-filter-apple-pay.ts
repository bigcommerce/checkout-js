import { isApplePayWindow } from './';

export default function shouldFilterApplePay(methodId: string, isBrowserSupport: boolean): boolean {
    return Boolean(methodId === 'applepay' && !isApplePayWindow(window) && !isBrowserSupport);
}
