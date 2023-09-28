import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { isAccountInstrument } from '../../guards';

import AccountInstrumentFieldset, {
    AccountInstrumentFieldsetProps,
    AccountInstrumentFieldsetValues,
} from './AccountInstrumentFieldset';

describe('AccountInstrumentFieldset', () => {
    let defaultProps: AccountInstrumentFieldsetProps;
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
    });

    it('shows instrument dropdown', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} />
                </Formik>
            </CheckoutContext.Provider>,
        );

        const component = screen.getByTestId('account-instrument-fieldset');

        expect(component).toBeInTheDocument();
    });

    it('shows the new address message when the list of instruments is empty', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                </Formik>
            </CheckoutContext.Provider>,
        );

        expect(screen.getByTestId('instrument-select-note')).toBeInTheDocument();
    });

    it('shows the dropdown when the list of instruments is empty', () => {
        render(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                </Formik>
            </CheckoutContext.Provider>,
        );

        expect(screen.getByTestId('account-instrument-select')).toBeInTheDocument();
    });
});
