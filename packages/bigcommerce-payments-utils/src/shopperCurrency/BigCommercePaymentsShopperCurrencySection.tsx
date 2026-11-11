import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { getUniquePaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import BigCommercePaymentsShopperCurrency from './BigCommercePaymentsShopperCurrency';
import { getShopperCurrencyOffer } from './shopperCurrency';

/**
 * PAYPAL-7373: renders the currency choice in the section checkout keeps above the payment
 * methods list for a method with `initializationData.hasSectionOnTopOfPaymentsList` (built for
 * Stripe Adaptive Pricing). Mounted from the BCP PayPal method title, which checkout renders
 * whether or not the method is selected.
 */
const BigCommercePaymentsShopperCurrencySection: FunctionComponent<{
    method?: PaymentMethod;
}> = ({ method }) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const hasOffer = Boolean(
        method?.initializationData?.hasSectionOnTopOfPaymentsList &&
            getShopperCurrencyOffer(method),
    );
    const containerId = method
        ? `${getUniquePaymentMethodId(method.id, method.gateway)}-provider-section-on-top-of-payments-list`
        : undefined;

    // The section is rendered next to the payment methods list, so it is in the DOM once mounted.
    useEffect(() => {
        setContainer(hasOffer && containerId ? document.getElementById(containerId) : null);
    }, [hasOffer, containerId]);

    const offer = method ? getShopperCurrencyOffer(method) : undefined;

    if (!method || !offer || !container) {
        return null;
    }

    // An offer for a new country (after an address change) starts over: the shopper currency is
    // preselected again until the shopper chooses
    return createPortal(
        <BigCommercePaymentsShopperCurrency
            key={`${offer.countryCode}-${offer.currency}`}
            method={method}
        />,
        container,
    );
};

export default BigCommercePaymentsShopperCurrencySection;
