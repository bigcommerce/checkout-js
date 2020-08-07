import { mount } from 'enzyme';
import { Formik, FormikValues } from 'formik';
import { noop } from 'lodash';
import React, { ReactElement } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext } from '../../locale';

import CreditCardFieldset from './CreditCardFieldset';

const setup = (component: ReactElement, formValues: FormikValues = {}) => {
    return mount(
        <LocaleContext.Provider value={ createLocaleContext(getStoreConfig()) }>
            <Formik
                initialValues={ formValues }
                onSubmit={ noop }
            >
                { component }
            </Formik>
        </LocaleContext.Provider>
    );
};

describe('CreditCardFieldset', () => {

    it('matches snapshot', () => {
        expect(setup(<CreditCardFieldset />).render()).toMatchSnapshot();
    });

    it('shows card code field when configured', () => {
        const component = setup(<CreditCardFieldset shouldShowCardCodeField={ true } />);

        expect(component.find('input[name="ccCvv"]').exists())
            .toEqual(true);
    });

    it('shows customer code field when configured', () => {
        const component = setup(<CreditCardFieldset shouldShowCustomerCodeField={ true } />);

        expect(component.find('input[name="ccCustomerCode"]').exists())
            .toEqual(true);
    });

    it('does not show card code field or customer code field by default', () => {
        const component = setup(<CreditCardFieldset />);

        expect(component.find('input[name="ccCvv"]').exists())
            .toEqual(false);

        expect(component.find('input[name="ccCustomerCode"]').exists())
            .toEqual(false);
    });

    it('shows "save card" and "make default" inputs when configured', () => {
        const component = setup(<CreditCardFieldset shouldShowSaveCardField={ true } shouldShowSetAsDefault={ true } />);

        expect(component.find('input[name="shouldSaveInstrument"]').exists())
            .toBe(true);

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(true);
    });

    it('does not show the "save card" and "make default" inputs by default', () => {
        const component = setup(<CreditCardFieldset />);

        expect(component.find('input[name="shouldSaveInstrument"]').exists())
            .toBe(false);

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(false);
    });
});
