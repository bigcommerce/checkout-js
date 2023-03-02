import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-utils';

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
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <BlueSnapDirectNumberField {...options} />
                </LocaleContext.Provider>
            </Formik>,
        );

        component
            .find('input[name="someNumber"]')
            .simulate('change', { target: { value: '999999999', name: 'someNumber' } })
            .update();

        expect(component.find('input[name="someNumber"]').prop('value')).toBe('999999999');
    });
});
