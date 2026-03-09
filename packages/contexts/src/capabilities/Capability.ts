import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';

export const defaultCapabilities: Capabilities = {
    userJourney: {
        quoteCheckout: false,
        invoiceCheckout: false,
        disableEditCart: false,
    },
    customer: {
        inlineSignIn: false,
        verifyPurchasability: false,
        superAdminCompanySelector: false,
        guestAccountCreation: false,
        b2bCompanySignupRedirect: false,
    },
    shipping: {
        manualAddressEntry: false,
        companyAddressBook: false,
        prefillCompanyAddress: false,
        saveToCompanyAddressBook: false,
        saveToCustomerAddressBook: false,
        lockQuoteShipping: false,
        extraShippingFields: false,
    },
    billing: {
        manualAddressEntry: false,
        extraBillingFields: false,
        companyAddressBook: false,
        billingSameAsShippingAdmin: false,
        lockQuoteBilling: false,
    },
    payment: {
        paymentMethodFiltering: false,
        b2bPaymentMethodFilter: false,
        poPaymentMethod: false,
        additionalPaymentNotes: false,
        excludeOfflineForInvoice: false,
        excludePPSDK: false,
    },
    orderConfirmation: {
        orderSummary: false,
        persistB2BMetadata: false,
        storeQuoteId: false,
        storeInvoiceReference: false,
        invoiceRedirect: false,
    },
};
