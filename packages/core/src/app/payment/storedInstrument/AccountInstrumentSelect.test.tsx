import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, type FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { type Omit } from 'utility-types';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import AccountInstrumentSelect, { type AccountInstrumentSelectProps } from './AccountInstrumentSelect';
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
        render(
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

        expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
    });

    it('shows "use different account" label if no instrument is selected', () => {
        render(
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

        expect(screen.getByText('Use a different account')).toBeInTheDocument();
    });

    it('shows list of instruments when clicked', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));

        expect(screen.getByTestId('instrument-select-menu')).toBeInTheDocument();
        expect(screen.getByTestId('instrument-select-externalId')).toHaveTextContent('test@external-id.com');
        expect(screen.getByTestId('instrument-select-externalId')).toBeVisible();
        expect(screen.getByText('test@external-id-2.com')).toBeVisible();
    });

    it('hides list of instruments by default', () => {
        render(
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

        expect(screen.queryByTestId('instrument-select-menu')).not.toBeInTheDocument();
    });

    it('notifies parent when instrument is selected', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));
        await userEvent.click(screen.getAllByTestId('instrument-select-option')[1]);

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('4123');
    });

    it('notifies parent when user wants to use new card', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));
        await userEvent.click(screen.getByTestId('instrument-select-option-use-new'));

        expect(defaultProps.onUseNewInstrument).toHaveBeenCalled();
    });

    it('submits the instrumentId', async () => {
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
                        <form data-test="form-test" onSubmit={handleSubmit}>
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

        render(
            <Component selectedInstrumentId={defaultProps.selectedInstrumentId} show={true} />,
        );

        const form = screen.getByTestId('form-test');

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submit).toHaveBeenCalledWith({ instrumentId: '1234' }, expect.anything());
    });

    it('shows list of instruments when clicked and is an account instrument', async () => {
        defaultProps.instruments = getInstruments().filter(isBankAccountInstrument);

        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));

        expect(screen.getByTestId('instrument-select-menu')).toBeInTheDocument();
        expect(screen.getByText('Account number ending in: ABC')).toBeInTheDocument();
        expect(screen.getAllByTestId('instrument-select-option')).toHaveLength(2);
    });

    it('notifies parent when instrument is selected and is an account instrument', async () => {
        defaultProps.instruments = getInstruments().filter(isBankAccountInstrument);

        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));
        await userEvent.click(screen.getAllByTestId('instrument-select-option')[1]);

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('45454545');
    });
});
