import { type StoreConfig } from '@bigcommerce/checkout-sdk/essential';

export const isEnhancedThemeV1Enabled = (config?: StoreConfig): boolean => {
    if (!config?.checkoutSettings) {
        return false;
    }

    return config.checkoutSettings.checkoutUserExperienceSettings.enhancedCheckoutThemeV1 ?? false;
};
