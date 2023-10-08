import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectNumberField, {
    BlueSnapDirectNumberFieldProps,
} from './BlueSnapDirectNumberField';

describe('BlueSnapDirectNumberField', () => {
    let initialValues: { someNumber: string };
    let options: BlueSnapDirectNumberFieldProps;

    beforeEach(() => {
        initialValues = {
            someNumber: '',
        };

        options = {
            labelContent: 'Some Number',
            name: 'someNumber',
        };
    });

    it('allows user to type in a number', () => {
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectNumberField {...options} />
            </Formik>,
        );

        const numberField = screen.getByLabelText<HTMLInputElement>('Some Number');

        fireEvent.change(numberField, { target: { value: '999999999' } });

        expect(numberField.value).toBe('999999999');
    });
});
