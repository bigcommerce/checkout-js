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
        restrictManualAddressEntry: false,
        companyAddressBook: false,
        prefillCompanyAddress: false,
        saveToCompanyAddressBook: false,
        hideSaveToAddressBookCheck: false,
        lockQuoteShipping: false,
        extraShippingFields: false,
        hideBillingSameAsShippingCheck: false,
    },
    billing: {
        restrictManualAddressEntry: false,
        extraBillingFields: false,
        companyAddressBook: false,
        billingSameAsShippingAdmin: false,
        lockQuoteBilling: false,
        hideSaveToAddressBookCheck: false,
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
