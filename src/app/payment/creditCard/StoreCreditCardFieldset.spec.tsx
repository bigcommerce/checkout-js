import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';

import CreditCardStorageField from './CreditCardStorageField';
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

    it('shows "make default" input as disabled by default', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(true);
    });

    it('enables "make default" input after "save" is clicked', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreCreditCardFieldset shouldShowSetAsDefault={ true } />
            </Formik>
        );

        const saveOnChange = component.find(CreditCardStorageField).prop('onChange');

        if (saveOnChange) {
            act(() => {
                saveOnChange(true);
            });
        }

        component.update();

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(false);
    });

});
