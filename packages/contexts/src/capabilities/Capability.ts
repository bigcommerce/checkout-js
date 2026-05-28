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
        paymentMethodFiltering: false,
        b2bPaymentMethodFilterType: null,
        poPaymentMethod: false,
        additionalPaymentNotes: false,
        excludeOfflineForInvoice: false,
        excludePPSDK: false,
        poConfig: null,
        additionalField: null,
    },
    orderConfirmation: {
        orderSummary: false,
        persistB2BMetadata: false,
        storeQuoteId: false,
        storeInvoiceReference: false,
        invoiceRedirect: false,
    },
};
