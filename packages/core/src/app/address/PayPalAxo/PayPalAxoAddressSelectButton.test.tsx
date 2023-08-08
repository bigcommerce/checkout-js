import { LanguageService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getAddress, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import PayPalAxoAddressSelectButton from './PayPalAxoAddressSelectButton';

jest.mock('./PayPalAxoStaticAddress', () => () => <div>PayPalAxoStaticAddress</div>);

describe('PayPalAxoAddressSelectButton', () => {
    const defaultProps = {
        language: { translate: jest.fn() } as unknown as LanguageService,
        addresses: [{
            ...getAddress(),
            id: 123,
            type: 'paypal-address',
        }],
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without already selected address', () => {
        render(
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <PayPalAxoAddressSelectButton {...defaultProps} />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('Enter a new address')).toBeInTheDocument();
    });

    it('renders with selected address', () => {
        render(
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <PayPalAxoAddressSelectButton
                    {...defaultProps}
                    selectedAddress={getAddress()}
                />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('PayPalAxoStaticAddress')).toBeInTheDocument();
    });
});
