import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, type FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';
import { type Omit } from 'utility-types';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    getCardInstrument,
    getInstruments,
    getStoreConfig,
    getYear,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { isCardInstrument } from '../../guards';

import InstrumentSelect, { type InstrumentSelectProps } from './InstrumentSelect';

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
        render(
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

        expect(
            screen.getByText(`Visa ending in ${getInstruments().find(isCardInstrument)?.last4}`),
        ).toBeInTheDocument();
        expect(screen.getByText(`Expires 02/${getYear(1)}`)).toBeInTheDocument();
    });

    it('shows "use different card" label if no instrument is selected', () => {
        render(
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

        expect(screen.getByText('Use a different card')).toBeInTheDocument();
    });

    it('shows list of instruments when clicked', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));

        expect(
            screen.getAllByText(`Visa ending in ${getInstruments().find(isCardInstrument)?.last4}`),
        ).toHaveLength(2);
        expect(
            screen.getByText(
                `American Express ending in ${getInstruments().filter(isCardInstrument)[1].last4}`,
            ),
        ).toBeInTheDocument();
    });

    it('highlights instrument that is already expired', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));

        expect(screen.getAllByTestId('instrument-select-option-expiry')[0]).toHaveClass(
            'instrumentSelect-expiry--expired',
        );
        expect(screen.getAllByTestId('instrument-select-option-expiry')[1]).not.toHaveClass(
            'instrumentSelect-expiry--expired',
        );
    });

    it('hides list of instruments by default', () => {
        render(
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

        expect(screen.queryByTestId('instrument-select-menu')).not.toBeInTheDocument();
    });

    it('notifies parent when instrument is selected', async () => {
        render(
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

        await userEvent.click(screen.getByTestId('instrument-select'));
        await userEvent.click(screen.getAllByTestId('instrument-select-option')[1]);

        expect(defaultProps.onSelectInstrument).toHaveBeenCalledWith('111');
    });

    it('notifies parent when user wants to use new card', async () => {
        render(
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

        render(<Component selectedInstrumentId={defaultProps.selectedInstrumentId} show={true} />);

        const form = screen.getByTestId('form-test');

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submit).toHaveBeenCalledWith({ instrumentId: '1234' }, expect.anything());
    });
});
