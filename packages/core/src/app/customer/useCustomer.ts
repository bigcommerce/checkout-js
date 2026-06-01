import {
    type CheckoutSelectors,
    type CustomerAccountRequestBody,
    type CustomerCredentials,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type ExecutePaymentMethodCheckoutOptions,
    type FormField,
    type GuestCredentials,
    type SignInEmail,
} from '@bigcommerce/checkout-sdk';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';

import { isFloatingLabelEnabled } from '../common/utility';
import getProviderWithCustomCheckout from '../payment/getProviderWithCustomCheckout';
import { PaymentMethodId } from '../payment/paymentMethod';

export interface CustomerData {
    // Basic customer data
    email?: string;
    firstName?: string;
    hasBillingId: boolean;
    isBuyNowCart: boolean;

    // Form data
    customerAccountFields: FormField[];
    canSubscribe: boolean;
    defaultShouldSubscribe: boolean;
    requiresMarketingConsent: boolean;
    isFloatingLabelEnabled?: boolean;

    // Configuration
    forgotPasswordUrl: string;
    privacyPolicyUrl?: string;
    isSignInEmailEnabled: boolean;
    isAccountCreationEnabled: boolean;
    isGuestEnabled: boolean;
    isExpressPrivacyPolicy: boolean;
    shouldRedirectToStorefrontForAuth: boolean;

    // Status flags
    isContinuingAsGuest: boolean;
    isExecutingPaymentMethodCheckout: boolean;
    isInitializing: boolean;
    isSigningIn: boolean;
    isSendingSignInEmail: boolean;
    isCreatingAccount: boolean;

    // Errors
    signInError?: Error;
    signInEmailError?: Error;
    createAccountError?: Error;

    // Other data
    signInEmail?: SignInEmail;
    checkoutButtonIds: string[];
    providerWithCustomCheckout?: string;
    isPaymentDataRequired: boolean;
    shouldRenderStripeForm: boolean;
}

export interface CustomerActions {
    clearError: (error: Error) => Promise<CheckoutSelectors>;
    createAccount: (values: CustomerAccountRequestBody) => Promise<CheckoutSelectors>;
    continueAsGuest: (credentials: GuestCredentials) => Promise<CheckoutSelectors>;
    sendLoginEmail: (params: { email: string }) => Promise<CheckoutSelectors>;
    deinitializeCustomer: (options: CustomerRequestOptions) => Promise<CheckoutSelectors>;
    executePaymentMethodCheckout: (
        options: ExecutePaymentMethodCheckoutOptions,
    ) => Promise<CheckoutSelectors>;
    initializeCustomer: (options: CustomerInitializeOptions) => Promise<CheckoutSelectors>;
    signIn: (
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ) => Promise<CheckoutSelectors>;
}

export interface UseCustomerReturn {
    data: CustomerData;
    actions: CustomerActions;
}

export const useCustomer = (): UseCustomerReturn => {
    const {
        selectedState: {
            billingAddress,
            checkout,
            customer,
            cart,
            signInEmail,
            config,
            customerAccountFields,
            isPaymentDataRequired,
            signInError,
            signInEmailError,
            createCustomerAccountError,
            isContinuingAsGuest,
            isExecutingPaymentMethodCheckout,
            isInitializingCustomer,
            isSigningIn,
            isSendingSignInEmail,
            isCreatingCustomerAccount,
        },
        checkoutService,
    } = useCheckout(({ data, errors, statuses }) => ({
        billingAddress: data.getBillingAddress(),
        checkout: data.getCheckout(),
        customer: data.getCustomer(),
        cart: data.getCart(),
        signInEmail: data.getSignInEmail(),
        config: data.getConfig(),
        customerAccountFields: data.getCustomerAccountFields(),
        isPaymentDataRequired: data.isPaymentDataRequired(),
        signInError: errors.getSignInError(),
        signInEmailError: errors.getSignInEmailError(),
        createCustomerAccountError: errors.getCreateCustomerAccountError(),
        isContinuingAsGuest: statuses.isContinuingAsGuest(),
        isExecutingPaymentMethodCheckout: statuses.isExecutingPaymentMethodCheckout(),
        isInitializingCustomer: statuses.isInitializingCustomer(),
        isSigningIn: statuses.isSigningIn(),
        isSendingSignInEmail: statuses.isSendingSignInEmail(),
        isCreatingCustomerAccount: statuses.isCreatingCustomerAccount(),
    }));

    // Return null-like data if essential data is missing
    if (!checkout || !config || !cart) {
        return {
            data: {} as CustomerData,
            actions: {} as CustomerActions,
        };
    }

    const {
        checkoutSettings: {
            privacyPolicyUrl,
            requiresMarketingConsent,
            isSignInEmailEnabled,
            isAccountCreationEnabled,
            isExpressPrivacyPolicy,
            shouldRedirectToStorefrontForAuth,
            remoteCheckoutProviders: checkoutButtonIds,
            providerWithCustomCheckout,
        },
        shopperConfig: {
            showNewsletterSignup: canSubscribe,
            defaultNewsletterSignup: defaultShouldSubscribe,
        },
        links: { forgotPasswordLink: forgotPasswordUrl },
    } = config;

    const customCheckoutProvider = getProviderWithCustomCheckout(providerWithCustomCheckout);

    // Customer data
    const data: CustomerData = {
        // Basic customer data
        email: billingAddress?.email || customer?.email,
        firstName: customer?.firstName,
        hasBillingId: !!billingAddress?.id,
        isBuyNowCart: cart.source === 'BUY_NOW',

        // Form data
        customerAccountFields,
        canSubscribe,
        defaultShouldSubscribe,
        requiresMarketingConsent,
        isFloatingLabelEnabled: isFloatingLabelEnabled(config.checkoutSettings),

        // Configuration
        forgotPasswordUrl,
        privacyPolicyUrl,
        isSignInEmailEnabled,
        isAccountCreationEnabled,
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isExpressPrivacyPolicy,
        shouldRedirectToStorefrontForAuth,

        // Status flags
        isContinuingAsGuest,
        isExecutingPaymentMethodCheckout,
        isInitializing: isInitializingCustomer,
        isSigningIn,
        isSendingSignInEmail,
        isCreatingAccount: isCreatingCustomerAccount,

        // Errors
        signInError,
        signInEmailError,
        createAccountError: createCustomerAccountError,

        // Other data
        signInEmail,
        checkoutButtonIds,
        providerWithCustomCheckout: customCheckoutProvider,
        isPaymentDataRequired,
        shouldRenderStripeForm:
            customCheckoutProvider === PaymentMethodId.StripeUPE &&
            shouldUseStripeLinkByMinimumAmount(cart),
    };

    // Customer actions
    const actions: CustomerActions = {
        clearError: checkoutService.clearError,
        createAccount: checkoutService.createCustomerAccount,
        continueAsGuest: checkoutService.continueAsGuest,
        sendLoginEmail: checkoutService.sendSignInEmail,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        executePaymentMethodCheckout: checkoutService.executePaymentMethodCheckout,
        initializeCustomer: checkoutService.initializeCustomer,
        signIn: checkoutService.signInCustomer,
    };

    return {
        data,
        actions,
    };
};
