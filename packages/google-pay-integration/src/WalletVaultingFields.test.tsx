import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    getCustomer,
    getGuestCustomer,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import { WalletVaultingFields } from './WalletVaultingFields';

describe('WalletVaultingFields', () => {
    const SAVE_LABEL = 'Save this card for future transactions';
    const DISCLAIMER = /your card may be charged for future payments/;

    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;

    const methodWith = (config: Partial<PaymentMethod['config']>): PaymentMethod => ({
        ...getPaymentMethod(),
        config: { ...getPaymentMethod().config, ...config },
    });

    const renderFields = (method: PaymentMethod) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <WalletVaultingFields method={method} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
    });

    it('shows only the checkbox for a registered shopper when auto-vaulting is off', () => {
        renderFields(methodWith({ vaultingWalletEnabled: true }));

        expect(screen.getByLabelText(SAVE_LABEL)).toBeInTheDocument();
        expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
    });

    it('shows the checkbox and the disclaimer for a registered shopper when auto-vaulting is on', () => {
        renderFields(
            methodWith({ vaultingWalletEnabled: true, vaultInstrumentForAllWalletPayments: true }),
        );

        expect(screen.getByLabelText(SAVE_LABEL)).toBeInTheDocument();
        expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
    });

    it('shows only the disclaimer for a guest shopper when auto-vaulting is on', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        renderFields(
            methodWith({ vaultingWalletEnabled: true, vaultInstrumentForAllWalletPayments: true }),
        );

        expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
        expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
    });

    it('shows nothing for a guest shopper when auto-vaulting is off', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        renderFields(methodWith({ vaultingWalletEnabled: true }));

        expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
        expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
    });

    it('shows nothing when wallet vaulting is disabled', () => {
        renderFields(methodWith({ vaultingWalletEnabled: false }));

        expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
        expect(screen.queryByText(DISCLAIMER)).not.toBeInTheDocument();
    });
});
