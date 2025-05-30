import { ErrorMessage, useFormikContext } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { FormContext } from '@bigcommerce/checkout/ui';

export interface FormFieldErrorProps {
    name: string;
    testId?: string;
    errorId: string;
}

const FormFieldError: FunctionComponent<FormFieldErrorProps> = ({ name, testId, errorId }) => {
    // Get form context to check for errors
    const formikContext = useFormikContext<{ [key: string]: any }>();
    const hasError = formikContext?.errors?.[name] && formikContext?.touched?.[name];
    
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
                        {/* Show error message when form is submitted and there's an error */}
                        {isSubmitted && <ErrorMessage name={name} render={renderMessage} />}
                        
                        {/* When there's no error or form isn't submitted, render a hidden element with the same ID */}
                        {(!isSubmitted || !hasError) && (
                            <span 
                                aria-hidden="true"
                                className="is-srOnly" 
                                id={errorId} 
                            />
                        )}
                    </li>
                </ul>
            )}
        </FormContext.Consumer>
    );
};

export default memo(FormFieldError);
