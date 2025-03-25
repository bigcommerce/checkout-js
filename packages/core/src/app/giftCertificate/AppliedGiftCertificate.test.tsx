import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks'
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { default as AppliedGiftCertificate } from './AppliedGiftCertificate';
import { getGiftCertificate } from './giftCertificate.mock';

function roundTo(amount: number, decimals: number): string {
    const factor = 10 ** decimals;

    return (Math.round(amount * factor) / factor).toFixed(decimals);
}

describe('AppliedGiftCertificate', () => {
    const config = getStoreConfig();
    const giftCertificate = getGiftCertificate();

    it('renders correctly if gift certificate is applied', () => {
        render(<AppliedGiftCertificate giftCertificate={giftCertificate} />);

        const usedAmount = roundTo(giftCertificate.used * config.shopperCurrency.exchangeRate, parseInt(config.shopperCurrency.decimalPlaces, 10));
        const remainingAmount = roundTo(giftCertificate.remaining * config.shopperCurrency.exchangeRate, parseInt(config.shopperCurrency.decimalPlaces, 10));

        expect(screen.getByTestId('giftCertificate-amount')).toHaveTextContent(usedAmount);
        expect(screen.getByTestId('giftCertificate-remaining')).toHaveTextContent(remainingAmount);
        expect(screen.getByText(giftCertificate.code)).toBeInTheDocument();
    });

    it('does not render remaining section if no remaining amount', () => {
        render(<AppliedGiftCertificate giftCertificate={{ ...giftCertificate, remaining: 0 }} />);

        const remainingAmountElement = screen.queryByTestId('giftCertificate-remaining');

        expect(remainingAmountElement).not.toBeInTheDocument();
    });
});
