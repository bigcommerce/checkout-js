import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { CreditCardStorageField, CreditCardStoreAsDefaultField } from '../creditCard';
import {  AccountInstrumentStorageField, AccountInstrumentStoreAsDefaultField } from '../storedInstrument';

import StoreInstrumentFieldset from './StoreInstrumentFieldset';

describe('StoreInstrumentFieldset', () => {

    it('shows the "save" and "make default" inputs when configured', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(true);
    });

    it('shows "make default" input as disabled when "showSave" is set to true', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(true);
    });

    it('enables "make default" input after "save" is clicked', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
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

    it('shows "make default" input as enabled when "showSave" is set to false', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ false } showSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find('input[name="shouldSetAsDefaultInstrument"]').props().disabled).toBe(false);
    });

    it('uses card fields when "isAccountInstrument" is set to false', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ false } showSave={ true } showSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find(CreditCardStorageField).exists()).toBe(true);
        expect(component.find(CreditCardStoreAsDefaultField).exists()).toBe(true);
    });

    it('uses instrument fields when "isAccountInstrument" is set to true', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <StoreInstrumentFieldset isAccountInstrument={ true } showSave={ true } showSetAsDefault={ true } />
            </Formik>
        );

        expect(component.find(AccountInstrumentStorageField).exists()).toBe(true);
        expect(component.find(AccountInstrumentStoreAsDefaultField).exists()).toBe(true);
    });

});
