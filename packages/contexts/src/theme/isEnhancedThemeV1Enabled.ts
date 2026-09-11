import { type StoreConfig } from '@bigcommerce/checkout-sdk/essential';

import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

export const isEnhancedThemeV1Enabled = (config?: StoreConfig): boolean => {
    if (!config?.checkoutSettings) {
        return false;
    }

    const newThemeExperimentEnabled = isExperimentEnabled(
        config.checkoutSettings,
        'CHECKOUT-7962.update_font_style_on_checkout_page',
    );
    const newThemeSettingEnabled =
        config.checkoutSettings.checkoutUserExperienceSettings.enhancedCheckoutThemeV1 ?? false;

    return newThemeSettingEnabled && newThemeExperimentEnabled;
};
