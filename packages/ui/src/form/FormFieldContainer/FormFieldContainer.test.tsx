import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import FormFieldContainer, { type FormFieldContainerProps } from './FormFieldContainer';

describe('FormFieldContainer', () => {
    let defaultProps: FormFieldContainerProps;

    beforeEach(() => {
        defaultProps = {
            additionalClassName: 'test',
            children: <div>test</div>,
        };
    });

    it('renders formfieldcontainer component', () => {
        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => <FormFieldContainer {...defaultProps} />}
            />,
        );

        expect(screen.getByText('test')).toBeInTheDocument();
    });
});
