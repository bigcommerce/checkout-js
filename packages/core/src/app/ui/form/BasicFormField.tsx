import { Field, type FieldConfig, type FieldProps, getIn } from 'formik';
import { isDate, noop } from 'lodash';
import React, {
    createElement,
    type FunctionComponent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import shallowEqual from 'shallowequal';

import FormFieldContainer from './FormFieldContainer';

export interface BasicFormFieldProps extends FieldConfig {
    additionalClassName?: string;
    className?: string;
    testId?: string;
    onChange?(value: any): void;
}

const BasicFormField: FunctionComponent<BasicFormFieldProps> = ({
    additionalClassName,
    className,
    component,
    render,
    testId,
    onChange,
    ...rest
}) => {
    const renderInnerField = useCallback(
        (props: FieldProps) => (
            <InnerField
                {...props}
                additionalClassName={additionalClassName}
                className={className}
                component={component}
                onChange={onChange}
                render={render}
                testId={testId}
            />
        ),
        [additionalClassName, className, component, render, testId, onChange],
    );

    return <Field {...rest}>{renderInnerField}</Field>;
};

type InnerFieldProps = Omit<BasicFormFieldProps, keyof FieldConfig> & InnerFieldInputProps;

const InnerField: FunctionComponent<InnerFieldProps> = memo(
    ({ additionalClassName, component, field, form, onChange, render, testId, meta }) => {
        const input = useMemo(
            () => (
                <InnerFieldInput
                    component={component}
                    field={field}
                    form={form}
                    meta={meta}
                    onChange={onChange}
                    render={render}
                />
            ),
            [field, form, onChange, component, render],
        );

        return (
            <FormFieldContainer
                additionalClassName={additionalClassName}
                hasError={getIn(form.errors, field.name)}
                testId={testId}
            >
                {input}
            </FormFieldContainer>
        );
    },
    (
        { form: prevForm, field: prevField, ...prevProps },
        { form: nextForm, field: nextField, ...nextProps },
    ) =>
        shallowEqual(prevProps, nextProps) &&
        shallowEqual(prevForm, nextForm) &&
        shallowEqual(prevField, nextField),
);

type InnerFieldInputProps = FieldProps &
    Pick<FieldConfig, 'component' | 'render'> & {
        onChange?(value: string): void;
    };

const InnerFieldInput: FunctionComponent<InnerFieldInputProps> = ({
    field,
    onChange = noop,
    component = 'input',
    render,
    ...props
}) => {
    const prevValueRef = useRef<unknown>(field.value);

    useEffect(() => {
         
        const comparableValue = isDate(field.value) ? field.value.getTime() : field.value;
        const comparablePrevValue = isDate(prevValueRef.current)
            ? prevValueRef.current.getTime()
            : prevValueRef.current;

        if (comparableValue !== comparablePrevValue) {
            onChange(field.value);
        }

        prevValueRef.current = field.value;
    }, [field.value, onChange]);

    if (render) {
        return render({ field, ...props });
    }

    if (typeof component === 'string') {
        return createElement(component, field);
    }

     
    return createElement(component as any, { field, ...props });
};

export default memo(BasicFormField);
