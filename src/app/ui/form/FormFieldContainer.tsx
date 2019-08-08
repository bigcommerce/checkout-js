import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { FormContext } from './FormProvider';

export interface FormFieldContainerProps {
    additionalClassName?: string;
    className?: string;
    hasError?: boolean;
    testId?: string;
}

const FormFieldContainer: FunctionComponent<FormFieldContainerProps> = ({
    additionalClassName,
    children,
    className,
    hasError,
    testId,
}) => (
    <FormContext.Consumer>
        { ({ isSubmitted }) => (
            <div
                className={ className ? className : classNames(
                    'form-field',
                    additionalClassName,
                    { 'form-field--error': hasError && isSubmitted }
                ) }
                data-test={ testId }
            >
                { children }
            </div>
        ) }
    </FormContext.Consumer>
);

export default FormFieldContainer;
