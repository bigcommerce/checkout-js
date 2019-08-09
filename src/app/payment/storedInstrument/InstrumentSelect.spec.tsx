import { mount } from 'enzyme';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { Omit } from 'utility-types';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';

import { getInstrument, getInstruments } from './instruments.mock';
import InstrumentSelect, { InstrumentSelectProps } from './InstrumentSelect';

describe('InstrumentSelect', () => {
    let defaultProps: Omit<InstrumentSelectProps, keyof FieldProps<string>>;
    let localeContext: LocaleContextType;
    let initialValues: { instrumentId: string };

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments(),
            selectedInstrumentId: '123',
            onSelectInstrument: jest.fn(),
            onUseNewCard: jest.fn(),
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
                            <InstrumentSelect
                                { ...field }
                                { ...defaultProps }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('[data-test="instrument-select-last4"]').at(0).text())
            .toEqual('Visa ending in 4321');

        expect(component.find('[data-test="instrument-select-expiry"]').at(0).text())
            .toEqual('Expires 02/2020');
    });

    it('shows "use different card" label if no instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <InstrumentSelect
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
            .toEqual('Use a different card');
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
                            <InstrumentSelect
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
            .toContain('Visa ending in 4321');

        expect(component.find('[data-test="instrument-select-option"]').at(1).text())
            .toContain('American Express ending in 4444');
    });

    it('highlights instrument that is already expired', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <Field
                        name="instrumentId"
                        render={ (field: FieldProps<string>) => (
                            <InstrumentSelect
                                { ...field }
                                { ...defaultProps }
                                instruments={ [
                                    { ...getInstrument(), bigpayToken: 'expired_card', expiryMonth: '10', expiryYear: '15' },
                                    getInstrument(),
                                ] }
                            />
                        ) }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        component.find('[data-test="instrument-select"]')
            .simulate('click')
            .update();

        expect(component.find('[data-test="instrument-select-option-expiry"]').at(0).hasClass('instrumentSelect-expiry--expired'))
            .toEqual(true);

        expect(component.find('[data-test="instrument-select-option-expiry"]').at(1).hasClass('instrumentSelect-expiry--expired'))
            .toEqual(false);
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
                            <InstrumentSelect
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
                            <InstrumentSelect
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
            .toHaveBeenCalledWith('111');
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
                            <InstrumentSelect
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

        expect(defaultProps.onUseNewCard)
            .toHaveBeenCalled();
    });
});
