import { memoizeOne } from '@bigcommerce/memoize';
import { Form as FormikForm, FormikFormProps } from 'formik';
import { values } from 'lodash';
import React, { createRef, FunctionComponent, memo, useCallback, useRef } from 'react';

import { FormContextType, FormProvider } from '@bigcommerce/checkout/ui';

export interface FormProps extends FormikFormProps {
    testId?: string;
}

const Form: FunctionComponent<FormProps> = ({ className, testId, ...rest }) => {
    const ref = useRef({ containerRef: createRef<HTMLDivElement>() });

    const focusOnError = () => {
        const { current } = ref.current.containerRef;

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
            erroredFormField.focus({ preventScroll: true });

            try {
                erroredFormField.offsetParent?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
            } catch {
                erroredFormField.offsetParent?.scrollIntoView();
            }
        }
    };

    const handleSubmitCapture = useCallback(
        memoizeOne((setSubmitted: FormContextType['setSubmitted']) => {
            return () => {
                setSubmitted(true);

                // use timeout to allow Formik validation to happen
                setTimeout(() => focusOnError());
            };
        }),
        [focusOnError],
    );

    const renderContent = useCallback(
        memoizeOne(({ setSubmitted }: FormContextType) => {
            return (
                <div ref={ref.current.containerRef}>
                    <FormikForm
                        {...rest}
                        className={className}
                        data-test={testId}
                        noValidate
                        onSubmitCapture={handleSubmitCapture(setSubmitted)}
                    />
                </div>
            );
        }),
        [className, handleSubmitCapture, testId, ...values(rest)],
    );

    return <FormProvider>{renderContent}</FormProvider>;
};

export default memo(Form);
