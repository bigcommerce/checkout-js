import { ErrorMessage } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { FormContext } from '@bigcommerce/checkout/ui';

export interface FormFieldErrorProps {
    name: string;
    testId?: string;
    errorId: string;
}

const FormFieldError: FunctionComponent<FormFieldErrorProps> = ({ name, testId, errorId }) => {
    const renderMessage = useCallback(
        (message: string) => (
            <ul className="form-field-errors" data-test={testId}>
                <li className="form-field-error">
                    <label
                        aria-live="polite"
                        className="form-inlineMessage"
                        htmlFor={name}
                        id={errorId}
                        role="alert"
                    >
                        {message}
                    </label>
                </li>
            </ul>
        ),
        [errorId, name, testId],
    );

    return (
        <FormContext.Consumer>
            {({ isSubmitted }) =>
                isSubmitted && <ErrorMessage name={name} render={renderMessage} />
            }
        </FormContext.Consumer>
    );
};

export default memo(FormFieldError);
