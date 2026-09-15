import { type Capabilities } from '@bigcommerce/checkout-sdk';
import React from 'react';

import {
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
    useCapabilities,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import { CartHeaderLink } from './CartHeaderLink';

jest.mock('@bigcommerce/checkout/contexts', () => ({
    ...jest.requireActual('@bigcommerce/checkout/contexts'),
    useCapabilities: jest.fn(),
}));

describe('CartHeaderLink', () => {
    const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;

    const buyerPortalInvoiceConfig = {
        invoiceListUrl: '/account.php?action=order_status/#/invoice',
        receiptUrlTemplate: '/#/invoice?receiptId={receiptId}',
    };

    const legacyThemeInvoiceConfig = {
        invoiceListUrl: '/invoices',
        receiptUrlTemplate: '/invoice-payment-receipt/?id={receiptId}',
    };

    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    const renderComponent = (userJourney: Partial<Capabilities['userJourney']>) => {
        mockUseCapabilities.mockReturnValue({
            ...defaultCapabilities,
            userJourney: { ...defaultCapabilities.userJourney, ...userJourney },
        });

        return render(
            <LocaleContext.Provider value={localeContext}>
                <CartHeaderLink
                    cartUrl="/cart.php"
                    isBuyNowCart={false}
                    isMultiShippingMode={false}
                />
            </LocaleContext.Provider>,
        );
    };

    it('links to the invoice list url provided by the invoiceConfig capability', () => {
        renderComponent({ invoiceConfig: buyerPortalInvoiceConfig });

        expect(screen.getByTestId('cart-edit-link')).toHaveAttribute(
            'href',
            '/account.php?action=order_status/#/invoice',
        );
    });

    it('links to the legacy theme invoice list url when the capability carries it', () => {
        renderComponent({ invoiceConfig: legacyThemeInvoiceConfig });

        expect(screen.getByTestId('cart-edit-link')).toHaveAttribute('href', '/invoices');
    });

    it('links to the cart when invoiceConfig is unavailable', () => {
        renderComponent({ invoiceConfig: null });

        expect(screen.getByTestId('cart-edit-link')).toHaveAttribute('href', '/cart.php');
    });

    it('renders no link when invoiceConfig is unavailable and editing the cart is disabled', () => {
        renderComponent({ invoiceConfig: null, disableEditCart: true });

        expect(screen.queryByTestId('cart-edit-link')).not.toBeInTheDocument();
    });
});
