import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';

export const defaultCapabilities: Capabilities = {
    userJourney: {
        disableCoupon: false,
        disableEditCart: false,
        disableGiftCertificate: false,
        disableStoreCredit: false,
        hasCompanyAddressBook: false,
        hasAddressExtraFields: false,
        hasOrderExtraFields: false,
        requiresB2BToken: false,
        hasAddressLabel: false,
        quoteConfig: null,
    },
    customer: {
        superAdminCompanySelector: false,
    },
    shipping: {
        restrictManualAddressEntry: false,
        hideSaveToAddressBookCheck: false,
        hideBillingSameAsShippingCheck: false,
    },
    billing: {
        restrictManualAddressEntry: false,
        hideSaveToAddressBookCheck: false,
    },
    payment: {
        b2bPaymentMethodFilterType: null,
        invoicePaymentComment: false,
        poConfig: null,
        additionalField: null,
        hideCheckPaymentMethod: false,
    },
    orderConfirmation: {
        cannotCreatePersonalAccount: false,
        persistB2BMetadata: false,
        invoiceRedirect: false,
    },
};
