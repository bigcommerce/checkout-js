import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { isAccountInstrument } from '../../guards';

import AccountInstrumentFieldset, {
    AccountInstrumentFieldsetProps,
    AccountInstrumentFieldsetValues,
} from './AccountInstrumentFieldset';

describe('AccountInstrumentFieldset', () => {
    let defaultProps: AccountInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: AccountInstrumentFieldsetValues;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        const instruments = getInstruments().filter(isAccountInstrument);

        defaultProps = {
            instruments,
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrument: instruments[0],
        };
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        initialValues = {
            instrumentId: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows instrument dropdown', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        const component = screen.getByTestId('account-instrument-fieldset');

        expect(component).toBeInTheDocument();
    });

    it('shows the new address message when the list of instruments is empty', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(screen.getByTestId('instrument-select-note')).toBeInTheDocument();
    });

    it('shows the dropdown when the list of instruments is empty', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(screen.getByTestId('account-instrument-select')).toBeInTheDocument();
    });
});
