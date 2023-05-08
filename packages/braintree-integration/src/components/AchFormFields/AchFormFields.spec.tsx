import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { DynamicFormField } from '@bigcommerce/checkout/ui';

import { formFieldData } from '../';

import AchFormFields, { AchFormFieldsProps } from './AchFormFields';

describe('AchFormFields Component', () => {
    let container: ReactWrapper;

    it('should render with default formFieldData', () => {
        const props: AchFormFieldsProps = {
            fieldValues: formFieldData,
            handleChange: () => () => undefined,
            language: createLanguageService(),
        };

        container = mount(
            <Formik initialValues={{}} onSubmit={noop}>
                <AchFormFields {...props} />
            </Formik>,
        );

        expect(container.find(DynamicFormField)).toHaveLength(formFieldData.length);
    });
});
