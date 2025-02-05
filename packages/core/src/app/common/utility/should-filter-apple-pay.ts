import { isApplePayWindow } from './';

export default function shouldFilterApplePay(methodId: string, isBrowserSupported: boolean): boolean {
    if (methodId !== 'applepay') {
        return false;
    }

    return !isApplePayWindow(window) && !isBrowserSupported;
}
