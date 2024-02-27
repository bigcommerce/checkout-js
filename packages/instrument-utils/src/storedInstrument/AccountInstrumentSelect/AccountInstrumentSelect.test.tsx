import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { Omit } from 'utility-types';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import {
    isAccountInstrument,
    isAchInstrument,
    isBankAccountInstrument,
    isSepaInstrument,
} from '../../guards';

import AccountInstrumentSelect, { AccountInstrumentSelectProps } from './AccountInstrumentSelect';

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

        expect(screen.getAllByText('test@external-id.com')).toHaveLength(2);
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

    it('cleans the instrumentId when the component unmounts', async () => {
        jest.useFakeTimers();

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
                        <form aria-label="form" onSubmit={handleSubmit}>
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

        const { rerender } = render(
            <Component selectedInstrumentId={defaultProps.selectedInstrumentId} show={true} />,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        screen.getByRole('form').submit();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submit).toHaveBeenCalledWith({ instrumentId: '1234' }, expect.anything());

        rerender(<Component selectedInstrumentId="" show={true} />);

        fireEvent.click(screen.getByTestId('instrument-select'));

        fireEvent.click(screen.getByTestId('instrument-select-option-use-new'));

        jest.runOnlyPendingTimers();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        screen.getByRole('form').submit();

        await new Promise((resolve) => process.nextTick(resolve));

        jest.useRealTimers();

        expect(submit).toHaveBeenCalledWith({ instrumentId: '' }, expect.anything());
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
        expect(screen.getByText('Issuer: DEF')).toBeInTheDocument();
    });

    it('shows list of instruments when clicked and is an ach instrument', async () => {
        defaultProps.instruments = getInstruments().filter(isAchInstrument);

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

        expect(screen.getAllByText('ACH')[0]).toBeInTheDocument();
        expect(screen.getByText('Account number ending in: 0000')).toBeInTheDocument();
        expect(screen.getByText('Routing Number: 011000015')).toBeInTheDocument();
    });

    it('shows list of instruments when clicked and is an SEPA instrument', async () => {
        defaultProps.instruments = getInstruments().filter(isSepaInstrument);

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
        expect(screen.getByText('Account Number (IBAN): DE133123xx111')).toBeInTheDocument();
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
