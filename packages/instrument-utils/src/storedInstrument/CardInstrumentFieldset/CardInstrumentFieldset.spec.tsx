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
import {
    CardInstrumentFieldsetValues,
    CheckoutContext,
} from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { isCardInstrument } from '../../guards';
import { InstrumentSelect } from '../InstrumentSelect';

import CardInstrumentFieldset, { CardInstrumentFieldsetProps } from './CardInstrumentFieldset';

describe('CardInstrumentFieldset', () => {
    let defaultProps: CardInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: CardInstrumentFieldsetValues;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrumentId: '123',
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
                        <CardInstrumentFieldset {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find(InstrumentSelect)).toHaveLength(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <CardInstrumentFieldset
                            {...defaultProps}
                            validateInstrument={<ValidateInstrument />}
                        />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find(ValidateInstrument)).toHaveLength(1);
    });

    it('hides expiry date', () => {
        defaultProps.shouldHideExpiryDate = true;

        const component = mount(
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <CardInstrumentFieldset {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>,
        );

        expect(component.find('.instrumentSelect-expiry')).toHaveLength(0);
    });
});
