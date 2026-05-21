import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';

export const defaultCapabilities: Capabilities = {
    userJourney: {
        disableEditCart: false,
        disableStoreCredit: false,
        hasCompanyAddressBook: false,
        hasAddressExtraFields: false,
        hasOrderExtraFields: false,
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
        additionalField: null,
        paymentMethodFiltering: false,
        b2bPaymentMethodFilter: false,
        poPaymentMethod: false,
        poConfig: null,
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
