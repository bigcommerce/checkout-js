import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import TextFieldForm, { type TextFieldFormProps } from './TextFieldForm';

describe('TextFieldForm', () => {
    let defaultProps: TextFieldFormProps;
    let TextFieldFormTest: FunctionComponent<TextFieldFormProps>;
    let initialValues: {
        ccDocument?: string;
    };

    beforeEach(() => {
        defaultProps = {
            additionalClassName: 'custom-additional-class-name',
            autoComplete: 'custom-auto-complete-label',
            labelId: 'custom-label-id',
            name: 'custom-name',
        };

        initialValues = { ccDocument: '' };

        const checkoutService = createCheckoutService();

        TextFieldFormTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TextFieldForm {...props} />
                </Formik>
            </LocaleProvider>
        );
    });

    it('renders text field with provided name', () => {
        render(<TextFieldFormTest {...defaultProps} />);

        expect(screen.getByLabelText('optimized_checkout.custom-label-id')).toBeInTheDocument();
    });
});
