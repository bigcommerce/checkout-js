import { type StoreConfig } from '@bigcommerce/checkout-sdk/essential';

export const isThemeV2Enabled = (config?: StoreConfig): boolean => {
    if (!config?.checkoutSettings) {
        return false;
    }

    const newThemeExperimentEnabled = Boolean(
        config.checkoutSettings.features['CHECKOUT-7962.update_font_style_on_checkout_page'] ??
            true,
    );
    const newThemeSettingEnabled = Boolean(
        config.checkoutSettings.checkoutUserExperienceSettings.checkoutV2Theme ?? false,
    );

    return newThemeSettingEnabled && newThemeExperimentEnabled;
};
