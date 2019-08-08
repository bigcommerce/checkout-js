import { Form as FormikForm, FormikFormProps } from 'formik';
import React, { createRef, Component, RefObject } from 'react';

import FormProvider from './FormProvider';

export interface FormProps extends FormikFormProps {
    testId?: string;
}

class Form extends Component<FormProps> {
    private containerRef: RefObject<HTMLDivElement> = createRef();

    render() {
        const {
            className,
            testId,
            ...rest
        } = this.props;

        return (
            <FormProvider>
                { ({ setSubmitted }) => (
                    <div ref={ this.containerRef }>
                        <FormikForm
                            { ...rest }
                            className={ className }
                            data-test={ testId }
                            onSubmitCapture={ () => {
                                setSubmitted(true);
                                // use timeout to allow Formik validation to happen
                                setTimeout(() => this.focusOnError());
                            } }
                            noValidate
                        />
                    </div>
                )}
            </FormProvider>
        );
    }

    private focusOnError() {
        const { current } = this.containerRef;

        if (!current) {
            return;
        }

        const errorInputSelectors = [
            '.form-field--error input',
            '.form-field--error textarea',
            '.form-field--error select',
        ];

        const erroredFormField = current.querySelector<HTMLElement>(errorInputSelectors.join(', '));

        if (erroredFormField) {
            erroredFormField.focus();
        }
    }
}

export default Form;
