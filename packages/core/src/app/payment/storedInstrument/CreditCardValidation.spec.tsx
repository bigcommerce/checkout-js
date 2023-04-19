import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';
import { CreditCardCodeField, CreditCardNumberField } from '../creditCard';

import CreditCardValidation from './CreditCardValidation';

describe('CreditCardValidation', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows card number field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(CreditCardNumberField)).toHaveLength(1);
    });

    it('hides card number field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={false}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(CreditCardNumberField)).toHaveLength(0);
    });

    it('shows card code field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(CreditCardCodeField)).toHaveLength(1);
    });

    it('hides card code field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={false}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(CreditCardCodeField)).toHaveLength(0);
    });
});
