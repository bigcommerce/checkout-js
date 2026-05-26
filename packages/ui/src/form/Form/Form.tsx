/* istanbul ignore file */
import { memoizeOne } from '@bigcommerce/memoize';
import { Form as FormikForm, type FormikFormProps } from 'formik';
import { values } from 'lodash';
import React, { createRef, type FunctionComponent, memo, useCallback, useRef } from 'react';

import { type FormContextType, FormProvider } from '../contexts';

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

        // :not selectors are used to make focus on error to be on phone input and not country search
        const errorInputSelectors = [
            '.form-field--error input:not([type="search"]):not([type="hidden"])',
            '.form-field--error textarea',
            '.form-field--error select',
        ];

        const erroredFormField = Array.from(
            current.querySelectorAll<HTMLElement>(errorInputSelectors.join(', ')),
        ).find((el) => el.offsetParent !== null);

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

    // TODO: Remove inline lint ignore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // TODO: Remove inline lint ignore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [className, handleSubmitCapture, testId, ...values(rest)],
    );

    return <FormProvider>{renderContent}</FormProvider>;
};

export default memo(Form);
