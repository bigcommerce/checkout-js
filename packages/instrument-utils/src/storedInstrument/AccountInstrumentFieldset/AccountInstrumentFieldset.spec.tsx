import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { isAccountInstrument } from '../../guards';
import { AccountInstrumentSelect } from '../AccountInstrumentSelect';

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
        const component = mount(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find(AccountInstrumentSelect)).toHaveLength(1);
    });

    it('shows the new address message when the list of instruments is empty', () => {
        const component = mount(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find('.instrumentSelect-note')).toHaveLength(1);
    });

    it('shows the dropdown when the list of instruments is empty', () => {
        const component = mount(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find(AccountInstrumentSelect)).toHaveLength(1);
    });
});
