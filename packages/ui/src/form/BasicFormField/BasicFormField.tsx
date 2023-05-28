import { Field, FieldConfig, FieldProps, getIn } from 'formik';
import { isDate, noop } from 'lodash';
import React, {
    Component,
    createElement,
    FunctionComponent,
    memo,
    useCallback,
    useMemo,
} from 'react';
import shallowEqual from 'shallowequal';

import { FormFieldContainer } from '../FormFieldContainer';

export interface BasicFormFieldProps extends FieldConfig {
    additionalClassName?: string;
    className?: string;
    testId?: string;
    onChange?(value: any): void;
}

type InnerFieldInputProps = FieldProps &
    Pick<FieldConfig, 'component' | 'render'> & {
        onChange?(value: string): void;
    };

type InnerFieldProps = Omit<BasicFormFieldProps, keyof FieldConfig> & InnerFieldInputProps;

class InnerFieldInput extends Component<InnerFieldInputProps> {
    componentDidUpdate({ field: prevField }: InnerFieldInputProps) {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            field: { value },
            onChange = noop,
        } = this.props;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const comparableValue = isDate(value) ? value.getTime() : value;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const comparablePrevValue = isDate(prevField.value)
            ? prevField.value.getTime()
            : prevField.value;

        if (comparableValue !== comparablePrevValue) {
            onChange(value);
        }
    }

    render() {
        const { component = 'input', field, render } = this.props;

        if (render) {
            return render(this.props);
        }

        if (typeof component === 'string') {
            return createElement(component, field);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        return createElement(component as any, this.props);
    }
}

const InnerField: FunctionComponent<InnerFieldProps> = memo(
    ({ additionalClassName, component, field, form, onChange, render, testId }) => {
        const input = useMemo(
            () => (
                <InnerFieldInput
                    component={component}
                    field={field}
                    form={form}
                    onChange={onChange}
                    render={render}
                />
            ),
            [field, form, onChange, component, render],
        );

        return (
            <FormFieldContainer
                additionalClassName={additionalClassName}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    return <Field {...rest} render={renderInnerField} />;
};

export default memo(BasicFormField);
