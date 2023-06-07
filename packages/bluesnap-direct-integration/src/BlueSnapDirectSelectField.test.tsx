import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectSelectField, {
    BlueSnapDirectSelectFieldProps,
} from './BlueSnapDirectSelectField';

describe('BlueSnapDirectSelectField', () => {
    let initialValues: { someOption: string };
    let options: BlueSnapDirectSelectFieldProps;

    beforeEach(() => {
        initialValues = {
            someOption: '',
        };

        options = {
            labelContent: 'Some Select',
            name: 'someSelect',
            options: {
                helperLabel: 'Select an option',
                items: [
                    { label: 'Foo', value: 'foo' },
                    { label: 'Bar', value: 'bar' },
                    { label: 'Baz', value: 'baz' },
                ],
            },
        };
    });

    it('allows user to select an option', () => {
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <BlueSnapDirectSelectField {...options} />
                </LocaleContext.Provider>
            </Formik>,
        );

        const selectElement = screen.getByLabelText<HTMLSelectElement>('Some Select');

        fireEvent.change(selectElement, { target: { value: 'bar' } });

        const selectedOption = screen.getByText<HTMLOptionElement>('Bar');
        const unselectedOption = screen.getByText<HTMLOptionElement>('Foo');

        expect(selectedOption.selected).toBe(true);
        expect(unselectedOption.selected).toBe(false);
    });
});
