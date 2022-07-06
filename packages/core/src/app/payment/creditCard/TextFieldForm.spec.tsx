import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { DocumentOnlyCustomFormFieldsetValues } from '../checkoutcomFieldsets/';

import TextFieldForm, { TextFieldFormProps } from './TextFieldForm';

describe('TextFieldForm', () => {
    let defaultProps: TextFieldFormProps;
    let TextFieldFormTest: FunctionComponent<TextFieldFormProps>;
    let initialValues: DocumentOnlyCustomFormFieldsetValues;

    beforeEach(() => {
        defaultProps = {
            additionalClassName: 'custom-additional-class-name',
            autoComplete: 'custom-auto-complete-label',
            labelId: 'custom-label-id',
            name: 'custom-name',
        };

        initialValues = { ccDocument: '' };

        TextFieldFormTest = props => (
            <Formik
                initialValues={ initialValues }
                onSubmit={ noop }
            >
                <TextFieldForm { ...props } />
            </Formik>
        );
    });

    it('renders text field with provided name', () => {
        const container = mount(<TextFieldFormTest { ...defaultProps } />);

        expect(container.find('input[id="custom-name"]').exists())
            .toEqual(true);
    });
});
