import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';

import { getInstruments } from './instruments.mock';
import isCardInstrument from './isCardInstrument';
import CardInstrumentFieldset, { CardInstrumentFieldsetProps, CardInstrumentFieldsetValues } from './CardInstrumentFieldset';
import InstrumentSelect from './InstrumentSelect';

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
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <CardInstrumentFieldset { ...defaultProps } />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(InstrumentSelect).length)
            .toEqual(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <CardInstrumentFieldset
                        { ...defaultProps }
                        validateInstrument={ <ValidateInstrument /> }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(ValidateInstrument).length)
            .toEqual(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <CardInstrumentFieldset
                        { ...defaultProps }
                        selectedInstrumentId={ undefined }
                        validateInstrument={ <ValidateInstrument /> }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(ValidateInstrument).length)
            .toEqual(1);
    });
});
