import { ErrorMessage } from 'formik';
import React, { FunctionComponent } from 'react';

import { FormContext } from './FormProvider';

export interface FormFieldErrorProps {
    name: string;
    testId?: string;
}

const FormFieldError: FunctionComponent<FormFieldErrorProps> = ({
    name,
    testId,
}) => (
    <FormContext.Consumer>
        { ({ isSubmitted }) => isSubmitted &&
            <ErrorMessage
                name={ name }
                render={ message => (
                    <ul
                        className="form-field-errors"
                        data-test={ testId }>
                        <li className="form-field-error">
                            <label
                                className="form-inlineMessage"
                                htmlFor={ name }>
                                { message }
                            </label>
                        </li>
                    </ul>
                ) }
            />
        }
    </FormContext.Consumer>
);

export default FormFieldError;
