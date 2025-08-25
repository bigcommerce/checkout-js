import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { type CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments, getStoreConfig, getYear } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { isCardInstrument } from '../../guards/';

import CardInstrumentFieldset, { type CardInstrumentFieldsetProps } from './CardInstrumentFieldset';

describe('CardInstrumentFieldset', () => {
    let defaultProps: CardInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: CardInstrumentFieldsetValues;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrumentId: '123',
        };

        initialValues = {
            instrumentId: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows instrument dropdown', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CardInstrumentFieldset {...defaultProps} />
                </Formik>
            </LocaleContext.Provider>,
        );
        expect(
            screen.getByText(`Visa ending in ${getInstruments().find(isCardInstrument)?.last4}`),
        ).toBeInTheDocument();
        expect(screen.getByText(`Expires 02/${getYear(1)}`)).toBeInTheDocument();
        expect(screen.getByTestId('instrument-select')).toBeInTheDocument();
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CardInstrumentFieldset
                        {...defaultProps}
                        validateInstrument={<ValidateInstrument />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('shows the validation form when an instrument is not selected', () => {
        const ValidateInstrument = () => <span>test2</span>;

        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CardInstrumentFieldset
                        {...defaultProps}
                        selectedInstrumentId={undefined}
                        validateInstrument={<ValidateInstrument />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('test2')).toBeInTheDocument();
    });
});
