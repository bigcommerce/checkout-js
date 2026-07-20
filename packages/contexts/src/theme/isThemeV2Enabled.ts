import { type StoreConfig } from '@bigcommerce/checkout-sdk/essential';

import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

export const isThemeV2Enabled = (config?: StoreConfig): boolean => {
    if (!config?.checkoutSettings) {
        return false;
    }

    const newThemeExperimentEnabled = isExperimentEnabled(
        config.checkoutSettings,
        'CHECKOUT-7962.update_font_style_on_checkout_page',
    );
    const newThemeSettingEnabled = Boolean(
        config.checkoutSettings.checkoutUserExperienceSettings.checkoutV2Theme ?? false,
    );

    return newThemeSettingEnabled && newThemeExperimentEnabled;
};
