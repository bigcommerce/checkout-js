import { ErrorMessage, getIn, useFormikContext } from 'formik';
import React, { type FunctionComponent, memo, useCallback } from 'react';

import { FormContext } from '../contexts';

export interface FormFieldErrorProps {
    name: string;
    testId?: string;
    errorId: string;
}

const FormFieldError: FunctionComponent<FormFieldErrorProps> = ({ name, testId, errorId }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formikContext = useFormikContext<Record<string, any>>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hasError = getIn(formikContext.errors, name) && getIn(formikContext.touched, name);

    const renderMessage = useCallback(
        (message: string) => (
            <label
                aria-live="polite"
                className="form-inlineMessage"
                htmlFor={name}
                id={errorId}
                role="alert"
            >
                {message}
            </label>
        ),
        [errorId, name],
    );

    return (
        <FormContext.Consumer>
            {({ isSubmitted }) => (
                <ul className="form-field-errors" data-test={testId}>
                    <li className="form-field-error">
                        {hasError && isSubmitted ? (
                            <ErrorMessage name={name} render={renderMessage} />
                        ) : (
                            <span aria-hidden="true" className="is-srOnly" id={errorId} />
                        )}
                    </li>
                </ul>
            )}
        </FormContext.Consumer>
    );
};

export default memo(FormFieldError);
