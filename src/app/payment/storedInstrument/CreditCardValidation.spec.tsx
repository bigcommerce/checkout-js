import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { ReactElement } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext } from '../../locale';
import { CreditCardCodeField, CreditCardNumberField } from '../creditCard';

import CreditCardValidation from './CreditCardValidation';

const setup = (component: ReactElement) => {
    return mount(
        <LocaleContext.Provider value={ createLocaleContext(getStoreConfig()) }>
            <Formik initialValues={ {} } onSubmit={ noop }>
                { component }
            </Formik>
        </LocaleContext.Provider>
    );
};

describe('CreditCardValidation', () => {

    it('shows card number field if configured', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ true }
                shouldShowNumberField={ true }
            />
        );

        expect(component.find(CreditCardNumberField).length)
            .toEqual(1);
    });

    it('hides card number field if configured', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ true }
                shouldShowNumberField={ false }
            />
        );

        expect(component.find(CreditCardNumberField).length)
            .toEqual(0);
    });

    it('shows card code field if configured', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ true }
                shouldShowNumberField={ true }
            />
        );

        expect(component.find(CreditCardCodeField).length)
            .toEqual(1);
    });

    it('hides card code field if configured', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ false }
                shouldShowNumberField={ true }
            />
        );

        expect(component.find(CreditCardCodeField).length)
            .toEqual(0);
    });

    it('shows the "make default" input if configured', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ true }
                shouldShowNumberField={ true }
                shouldShowSetCardAsDefault={ true }
            />
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(true);
    });

    it('hides the "make default" input by default', () => {
        const component = setup(
            <CreditCardValidation
                shouldShowCardCodeField={ true }
                shouldShowNumberField={ true }
            />
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(false);
    });
});
