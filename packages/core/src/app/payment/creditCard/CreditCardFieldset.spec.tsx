import { mount, render } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { CreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';

import CreditCardFieldset from './CreditCardFieldset';

describe('CreditCardFieldset', () => {
    let initialValues: CreditCardFieldsetValues;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot', () => {
        expect(
            render(
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={initialValues} onSubmit={noop}>
                        <CreditCardFieldset />
                    </Formik>
                </LocaleContext.Provider>,
            ),
        ).toMatchSnapshot();
    });

    it('shows card code field when configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardFieldset shouldShowCardCodeField={true} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('input[name="ccCvv"]').exists()).toBe(true);
    });

    it('shows customer code field when configured', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardFieldset shouldShowCustomerCodeField={true} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('input[name="ccCustomerCode"]').exists()).toBe(true);
    });

    it('does not show card code field or customer code field by default', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardFieldset />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('input[name="ccCvv"]').exists()).toBe(false);

        expect(component.find('input[name="ccCustomerCode"]').exists()).toBe(false);
    });
});
