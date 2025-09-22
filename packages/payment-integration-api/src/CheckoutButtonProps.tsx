import {
    type CheckoutSelectors,
    type CheckoutService,
    type CustomerInitializeOptions,
    type LanguageService,
} from '@bigcommerce/checkout-sdk';

export default interface CheckoutButtonProps {
    methodId: string;
    containerId: string;
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    checkoutButtonContainerClass?: string;
    additionalInitializationOptions?: Record<string, unknown>;
    language: LanguageService;
    integrations?: CustomerInitializeOptions['integrations'];
    onUnhandledError(error: Error): void;
    onWalletButtonClick(methodName: string): void;
}
