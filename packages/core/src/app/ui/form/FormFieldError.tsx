import { ErrorMessage } from 'formik';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { FormContext } from './FormProvider';

export interface FormFieldErrorProps {
    name: string;
    testId?: string;
}

const FormFieldError: FunctionComponent<FormFieldErrorProps> = ({
    name,
    testId,
}) => {
    const renderMessage = useCallback((message: string) => (
        <ul
            className="form-field-errors"
            data-test={ testId }
        >
            <li className="form-field-error">
                <label
                    aria-live="polite"
                    className="form-inlineMessage"
                    htmlFor={ name }
                    role="alert"
                >
                    { message }
                </label>
            </li>
        </ul>
    ), [
        name,
        testId,
    ]);

    return <FormContext.Consumer>
        { ({ isSubmitted }) => isSubmitted &&
            <ErrorMessage
                name={ name }
                render={ renderMessage }
            /> }
    </FormContext.Consumer>;
};

export default memo(FormFieldError);
