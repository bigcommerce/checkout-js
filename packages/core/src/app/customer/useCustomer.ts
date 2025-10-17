import { 
    type CheckoutSelectors,
    type CustomerAccountRequestBody,
    type CustomerCredentials,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type ExecutePaymentMethodCheckoutOptions,
    type FormField,
    type GuestCredentials,
    type SignInEmail
} from '@bigcommerce/checkout-sdk';

import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

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
    executePaymentMethodCheckout: (options: ExecutePaymentMethodCheckoutOptions) => Promise<CheckoutSelectors>;
    initializeCustomer: (options: CustomerInitializeOptions) => Promise<CheckoutSelectors>;
    signIn: (credentials: CustomerCredentials) => Promise<CheckoutSelectors>;
}

export interface UseCustomerReturn {
    data: CustomerData;
    actions: CustomerActions;
}

export const useCustomer = (): UseCustomerReturn => {
    const { checkoutState, checkoutService } = useCheckout();
    
    const {
        data: {
            getBillingAddress,
            getCustomerAccountFields,
            getCheckout,
            getCustomer,
            getCart,
            getSignInEmail,
            getConfig,
            isPaymentDataRequired,
        },
        errors: { getSignInError, getSignInEmailError, getCreateCustomerAccountError },
        statuses: {
            isContinuingAsGuest,
            isExecutingPaymentMethodCheckout,
            isInitializingCustomer,
            isSigningIn,
            isSendingSignInEmail,
            isCreatingCustomerAccount,
        },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const cart = getCart();
    const signInEmail = getSignInEmail();
    const config = getConfig();

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
        links: {
            forgotPasswordLink: forgotPasswordUrl,
        },
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
        customerAccountFields: getCustomerAccountFields(),
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
        isContinuingAsGuest: isContinuingAsGuest(),
        isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(),
        isInitializing: isInitializingCustomer(),
        isSigningIn: isSigningIn(),
        isSendingSignInEmail: isSendingSignInEmail(),
        isCreatingAccount: isCreatingCustomerAccount(),
        
        // Errors
        signInError: getSignInError(),
        signInEmailError: getSignInEmailError(),
        createAccountError: getCreateCustomerAccountError(),
        
        // Other data
        signInEmail,
        checkoutButtonIds,
        providerWithCustomCheckout: customCheckoutProvider,
        isPaymentDataRequired: isPaymentDataRequired(),
        shouldRenderStripeForm: customCheckoutProvider === PaymentMethodId.StripeUPE && shouldUseStripeLinkByMinimumAmount(cart),
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
