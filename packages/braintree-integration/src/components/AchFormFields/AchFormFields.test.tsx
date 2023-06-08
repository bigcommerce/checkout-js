import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { formFieldData } from '../';

import AchFormFields, { AchFormFieldsProps } from './AchFormFields';

describe('AchFormFields Component', () => {
    it('should render with default formFieldData', () => {
        const props: AchFormFieldsProps = {
            fieldValues: formFieldData,
            handleChange: () => () => undefined,
            language: createLanguageService(),
        };

        const { container } = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <AchFormFields {...props} />
            </Formik>,
        );

        // eslint-disable-next-line testing-library/no-node-access
        expect(container.children).toHaveLength(formFieldData.length);
    });
});
