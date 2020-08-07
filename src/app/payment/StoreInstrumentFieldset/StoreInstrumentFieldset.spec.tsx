import { mount } from 'enzyme';
import { Formik, FormikValues } from 'formik';
import { noop } from 'lodash';
import React, { ReactElement } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext } from '../../locale';

import StoreInstrumentFieldset from './';

const setup = (component: ReactElement, formValues: FormikValues = {} ) => {

    return mount(
        <LocaleContext.Provider value={ createLocaleContext(getStoreConfig()) }>
            <Formik initialValues={ formValues } onSubmit={ noop }>
                { component }
            </Formik>
        </LocaleContext.Provider>
    );
};

describe('StoreInstrumentFieldset', () => {

    it('does not render the "save" and "make default" inputs unless configured', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ false } showSetAsDefault={ false } />
        );

        expect(component.text()).not.toMatch(/save/i);
        expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);

        expect(component.text()).not.toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(false);
    });

    it('renders the "save" input when configured', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ false } />
        );

        expect(component.text()).toMatch(/save/i);
        expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);

        expect(component.text()).not.toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(false);
    });

    it('renders the "make default" input when configured', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ false } showSetAsDefault={ true } />
        );

        expect(component.text()).toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(true);

        expect(component.text()).not.toMatch(/save/i);
        expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);
    });

    it('renders "make default" input as disabled when "showSave" is set to true', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
        );

        expect(component.text()).toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(true);
    });

    it('renders the "make default" input as disabled when Formik passes shouldSaveInstrument as false', () => {
        const component = setup(
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />,
                { shouldSaveInstrument: true }
        );

        expect(component.text()).toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(false);
    });

    it('renders the "make default" input as enabled when Formik passes shouldSaveInstrument as true', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ false } showSetAsDefault={ true } />,
            { shouldSaveInstrument: true }
        );

        expect(component.text()).toMatch(/default/i);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(false);
    });

    it('uses card fields when "isAccountInstrument" is set to false', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
        );

        expect(component.text()).toMatch(/save/i);
        expect(component.text()).toMatch(/card/i);
        expect(component.text()).not.toMatch(/account/i);
    });

    it('uses instrument fields when "isAccountInstrument" is set to true', () => {
        const component = setup(
            <StoreInstrumentFieldset isAccountInstrument={ true } showSave={ true } showSetAsDefault={ true } />
        );

        expect(component.text()).toMatch(/save/i);
        expect(component.text()).toMatch(/account/i);
        expect(component.text()).not.toMatch(/card/i);
    });

});
