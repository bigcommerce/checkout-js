import { mount } from 'enzyme';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { Omit } from 'utility-types';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';

import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';
import AccountInstrumentSelect, { AccountInstrumentSelectProps } from './AccountInstrumentSelect';

/* eslint-disable react/jsx-no-bind */
describe('AccountInstrumentSelect', () => {
    let defaultProps: Omit<AccountInstrumentSelectProps, keyof FieldProps<string>>;
    let localeContext: LocaleContextType;
    let initialValues: { instrumentId: string };

    beforeEach(() => {
        const instruments = getInstruments().filter(isAccountInstrument);

        defaultProps = {
            instruments,
            selectedInstrumentId: instruments[0].bigpayToken,
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
        };

        initialValues = {
            instrumentId: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows info of selected instrument on dropdown button', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('[data-test="instrument-select"]').at(0).text())
            .toEqual('test@external-id.com');
    });

    it('shows "use different account" label if no instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                                selectedInstrumentId=""
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('[data-test="instrument-select"]').text())
            .toEqual('Use a different account');
    });

    it('shows list of instruments when clicked', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        component.find('[data-test="instrument-select"]')
            .simulate('click')
            .update();

        expect(component.exists('[data-test="instrument-select-menu"]'))
            .toEqual(true);

        expect(component.find('[data-test="instrument-select-option"]').at(0).text())
            .toContain('test@external-id.com');
    });

    it('hides list of instruments by default', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.exists('[data-test="instrument-select-menu"]'))
            .toEqual(false);
    });

    it('notifies parent when instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        component.find('[data-test="instrument-select"]')
            .simulate('click')
            .update();

        component.find('[data-test="instrument-select-option"]').at(1)
            .simulate('click')
            .update();

        expect(defaultProps.onSelectInstrument)
            .toHaveBeenCalledWith('4123');
    });

    it('notifies parent when user wants to use new card', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        component.find('[data-test="instrument-select"]')
            .simulate('click')
            .update();

        component.find('[data-test="instrument-select-option-use-new"]')
            .simulate('click')
            .update();

        expect(defaultProps.onUseNewInstrument)
            .toHaveBeenCalled();
    });
});
