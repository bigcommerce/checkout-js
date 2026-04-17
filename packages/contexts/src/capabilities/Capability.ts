import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';

export const defaultCapabilities: Capabilities = {
    userJourney: {
        disableEditCart: false,
        hasCompanyAddressBook: false,
        hasAddressExtraFields: false,
        requiresB2BToken: false,
    },
    customer: {
        superAdminCompanySelector: false,
    },
    shipping: {
        restrictManualAddressEntry: false,
        prefillCompanyAddress: false,
        hideSaveToAddressBookCheck: false,
        hideBillingSameAsShippingCheck: false,
    },
    billing: {
        restrictManualAddressEntry: false,
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
