import { mount } from 'enzyme';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { Omit } from 'utility-types';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import { getCardInstrument, getInstruments } from './instruments.mock';
import InstrumentSelect, { InstrumentSelectProps } from './InstrumentSelect';
import isCardInstrument from './isCardInstrument';

describe('InstrumentSelect', () => {
    let defaultProps: Omit<InstrumentSelectProps, keyof FieldProps<string>>;
    let localeContext: LocaleContextType;
    let initialValues: { instrumentId: string };

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            selectedInstrumentId: '123',
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
                            <InstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('[data-test="instrument-select-last4"]').at(0).text()).toBe(
            'Visa ending in 4321',
        );

        expect(component.find('[data-test="instrument-select-expiry"]').at(0).text()).toBe(
            'Expires 02/2025',
        );
    });

    it('shows "use different card" label if no instrument is selected', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <InstrumentSelect
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
            'Use a different card',
        );
    });

    it('shows list of instruments when clicked', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <InstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        expect(component.exists('[data-test="instrument-select-menu"]')).toBe(true);

        expect(component.find('[data-test="instrument-select-option"]').at(0).text()).toContain(
            'Visa ending in 4321',
        );

        expect(component.find('[data-test="instrument-select-option"]').at(1).text()).toContain(
            'American Express ending in 4444',
        );
    });

    it('highlights instrument that is already expired', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <InstrumentSelect
                                {...field}
                                {...defaultProps}
                                instruments={[
                                    {
                                        ...getCardInstrument(),
                                        bigpayToken: 'expired_card',
                                        expiryMonth: '10',
                                        expiryYear: '15',
                                    },
                                    getCardInstrument(),
                                ]}
                            />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        expect(
            component
                .find('[data-test="instrument-select-option-expiry"]')
                .at(0)
                .hasClass('instrumentSelect-expiry--expired'),
        ).toBe(true);

        expect(
            component
                .find('[data-test="instrument-select-option-expiry"]')
                .at(1)
                .hasClass('instrumentSelect-expiry--expired'),
        ).toBe(false);
    });

    it('hides list of instruments by default', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <InstrumentSelect {...field} {...defaultProps} />
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
                            <InstrumentSelect {...field} {...defaultProps} />
                        )}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        component.find('[data-test="instrument-select"]').simulate('click').update();

        component.find('[data-test="instrument-select-option"]').at(1).simulate('click').update();

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('111');
    });

    it('notifies parent when user wants to use new card', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <InstrumentSelect {...field} {...defaultProps} />
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
                                        <InstrumentSelect
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
});
