import { type Config } from '@bigcommerce/checkout-sdk';

const shippingQuoteFailedMessage =
    "Unfortunately one or more items in your cart can't be shipped to your location. Please choose a different delivery address.";

const checkoutSettings: Config = {
    context: {
        flashMessages: [],
        payment: {
            token: undefined,
        },
        checkoutId: 'xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx',
        geoCountryCode: 'AU',
    },
    customization: {
        languageData: [],
    },
    storeConfig: {
        cdnPath: 'https://cdn.bigcommerce.com',
        checkoutSettings: {
            checkoutBillingSameAsShippingEnabled: true,
            hasMultiShippingEnabled: true,
            enableOrderComments: true,
            enableTermsAndConditions: false,
            guestCheckoutEnabled: true,
            isCardVaultingEnabled: true,
            isCouponCodeCollapsed: true,
            isExpressPrivacyPolicy: false,
            isPaymentRequestEnabled: false,
            isPaymentRequestCanMakePaymentEnabled: false,
            isSignInEmailEnabled: true,
            isSpamProtectionEnabled: false,
            isTrustedShippingAddressEnabled: true,
            orderTermsAndConditions: '',
            orderTermsAndConditionsLocation: 'payment',
            orderTermsAndConditionsLink: '',
            orderTermsAndConditionsType: 'textarea',
            privacyPolicyUrl: '',
            shippingQuoteFailedMessage,
            isAccountCreationEnabled: true,
            realtimeShippingProviders: ['Fedex', 'UPS', 'USPS'],
            remoteCheckoutProviders: [],
            providerWithCustomCheckout: null,
            isAnalyticsEnabled: false,
            isStorefrontSpamProtectionEnabled: false,
            googleMapsApiKey: 'x',
            googleRecaptchaSitekey: 'x',
            features: {
                'CHECKOUT-9161.enable_storefront_guest_multi_shipping': true,
            },
            requiresMarketingConsent: false,
            checkoutUserExperienceSettings: {
                walletButtonsOnTop: true,
                floatingLabelEnabled: true,
            },
            shouldRedirectToStorefrontForAuth: false,
        },
        currency: {
            code: 'USD',
            decimalPlaces: '2',
            decimalSeparator: '.',
            isTransactional: true,
            symbolLocation: 'left',
            symbol: '$',
            thousandsSeparator: ',',
        },
        displayDateFormat: 'do MMM yyyy',
        displaySettings: {
            hidePriceFromGuests: false,
        },
        inputDateFormat: 'dd/MM/yyyy',
        formFields: {
            billingAddress: [],
            shippingAddress: [],
            customerAccount: [],
        },
        links: {
            cartLink: 'https://store.url/cart.php',
            checkoutLink: 'https://store.url/checkout',
            createAccountLink: 'https://store.url/login.php?action=create_account',
            forgotPasswordLink: 'https://store.url/login.php?action=reset_password',
            loginLink: 'https://store.url/login.php',
            orderConfirmationLink: 'https://store.url/checkout/order-confirmation',
            siteLink: 'https://store.url',
            logoutLink: 'https://store.url/login.php?action=logout',
        },
        paymentSettings: {
            bigpayBaseUrl: 'https:\\/\\/payments.bigcommerce.com',
            clientSidePaymentProviders: [],
        },
        shopperConfig: {
            defaultNewsletterSignup: false,
            passwordRequirements: {
                alpha: '[A-Za-z]',
                numeric: '[0-9]',
                minlength: 7,
                error: 'Passwords must be at least 7 characters and contain both alphabetic and numeric characters.',
            },
            showNewsletterSignup: true,
        },
        storeProfile: {
            orderEmail: 'order@example.com',
            shopPath: 'https:\\/\\/store.url',
            storeCountry: 'United States',
            storeCountryCode: 'US',
            storeHash: 'x',
            storeId: '100',
            storeName: 'Store Name',
            storePhoneNumber: '',
            storeLanguage: 'en_US',
        },
        imageDirectory: 'product_images',
        isAngularDebuggingEnabled: false,
        shopperCurrency: {
            code: 'USD',
            symbolLocation: 'left',
            symbol: '$',
            decimalPlaces: '2',
            decimalSeparator: '.',
            thousandsSeparator: ',',
            exchangeRate: 1,
            isTransactional: true,
        },
    },
};
const checkoutSettingsWithUnsupportedProvider = {
    ...checkoutSettings,
    storeConfig: {
        ...checkoutSettings.storeConfig,
        checkoutSettings: {
            ...checkoutSettings.storeConfig.checkoutSettings,
            providerWithCustomCheckout: 'applepay',
        },
    },
};
const checkoutSettingsWithErrorFlashMessage: Config = {
    ...checkoutSettings,
    context: {
        ...checkoutSettings.context,
        flashMessages: [
            {
                message: 'flash message',
                title: '',
                type: 'error',
            },
        ],
    },
};
const checkoutSettingsWithCustomErrorFlashMessage: Config = {
    ...checkoutSettings,
    context: {
        ...checkoutSettings.context,
        flashMessages: [
            {
                message: 'flash message',
                title: 'custom error title',
                type: 'error',
            },
        ],
    },
};
const checkoutSettingsWithRemoteProviders = {
    ...checkoutSettings,
    storeConfig: {
        ...checkoutSettings.storeConfig,
        checkoutSettings: {
            ...checkoutSettings.storeConfig.checkoutSettings,
            remoteCheckoutProviders: ['applepay'],
        },
    },
};

export {
    checkoutSettings,
    checkoutSettingsWithCustomErrorFlashMessage,
    checkoutSettingsWithErrorFlashMessage,
    checkoutSettingsWithUnsupportedProvider,
    checkoutSettingsWithRemoteProviders,
    shippingQuoteFailedMessage,
};
