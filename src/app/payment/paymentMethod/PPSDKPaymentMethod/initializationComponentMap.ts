import { NoUI } from './NoUI';
import { PPSDKPaymentMethod } from './PPSDKPaymentMethod';

type ComponentMap = Record<string, typeof PPSDKPaymentMethod>;

export const initializationComponentMap: ComponentMap = {
    none: NoUI,
};
