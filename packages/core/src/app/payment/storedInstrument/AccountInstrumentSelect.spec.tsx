import { mount } from 'enzyme';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { Omit } from 'utility-types';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import AccountInstrumentSelect, { AccountInstrumentSelectProps } from './AccountInstrumentSelect';
import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';

import { isBankAccountInstrument } from './index';

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
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('[data-test="instrument-select"]').at(0).text()).toBe(
            'test@external-id.com',
        );
    });

    it('shows "use different account" label if no instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect
                                {...field}
                                {...defaultProps}
                                selectedInstrumentId=""
                            />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('[data-test="instrument-select"]').text()).toBe(
            'Use a different account',
        );
    });

    it('shows list of instruments when clicked', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        expect(component.exists('[data-test="instrument-select-menu"]')).toBe(true);

        expect(component.find('[data-test="instrument-select-option"]').at(0).text()).toContain(
            'test@external-id.com',
        );
    });

    it('hides list of instruments by default', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.exists('[data-test="instrument-select-menu"]')).toBe(false);
    });

    it('notifies parent when instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        component.find('[data-test="instrument-select-option"]').at(1).simulate('click').update();

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('4123');
    });

    it('notifies parent when user wants to use new card', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        component.find('[data-test="instrument-select-option-use-new"]').simulate('click').update();

        expect(defaultProps.onUseNewInstrument).toHaveBeenCalled();
    });

    it('cleans the instrumentId when the component unmounts', async () => {
        const submit = jest.fn();

        initialValues.instrumentId = '1234';

        const Component = ({
            show,
            selectedInstrumentId,
        }: {
            show: boolean;
            selectedInstrumentId?: string;
        }) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={submit}>
                    {({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            {show && (
                                <Field name="instrumentId">
                                    {(field: FieldProps<string>) => (
                                        <AccountInstrumentSelect
                                            {...field}
                                            {...defaultProps}
                                            selectedInstrumentId={selectedInstrumentId}
                                        />
                                    )}
                                </Field>
                            )}
                        </form>
                    )}
                </Formik>
            </LocaleContext.Provider>
        );

        const component = mount(
            <Component selectedInstrumentId={defaultProps.selectedInstrumentId} show={true} />,
        );

        component.find('form').simulate('submit').update();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submit).toHaveBeenCalledWith({ instrumentId: '1234' }, expect.anything());

        component.setProps({ selectedInstrumentId: '' }).update();

        component.setProps({ show: false }).update();

        component.find('form').simulate('submit').update();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submit).toHaveBeenCalledWith({ instrumentId: '' }, expect.anything());
    });

    it('shows list of instruments when clicked and is an account instrument', () => {
        defaultProps.instruments = getInstruments().filter(isBankAccountInstrument);

        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        expect(component.exists('[data-test="instrument-select-menu"]')).toBe(true);

        expect(component.find('[data-test="instrument-select-option"]').at(0).text()).toContain(
            'Account number ending in: ABCIssuer: DEF',
        );
    });

    it('notifies parent when instrument is selected and is an account instrument', () => {
        defaultProps.instruments = getInstruments().filter(isBankAccountInstrument);

        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <AccountInstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        component.find('[data-test="instrument-select-option"]').at(1).simulate('click').update();

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('45454545');
    });
});
