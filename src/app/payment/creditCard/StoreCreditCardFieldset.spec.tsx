import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import StoreCreditCardFieldset from './StoreCreditCardFieldset';

describe('StoreCreditCardFieldset', () => {

    it('shows the "save" input by default', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ false } />
            </Formik>
        );

        expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
    });

    it('hides the "make default" input if "shouldShowSetAsDefault" is set to false', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ false } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(false);
    });

    it('shows the "make default" input if "shouldShowSetAsDefault" is set to true', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(true);
    });

    it('renders the "make default" input as disabled when Formik passes shouldSaveInstrument as false', () => {
        const component = mount(
            <Formik initialValues={ { shouldSaveInstrument: false } } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(true);
    });

    it('renders the "make default" input as enabled when Formik passes shouldSaveInstrument as true', () => {
        const component = mount(
            <Formik initialValues={ { shouldSaveInstrument: true } } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(false);
    });

});
