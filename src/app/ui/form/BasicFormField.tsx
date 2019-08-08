import { getIn, Field, FieldConfig, FieldProps } from 'formik';
import { isDate, noop } from 'lodash';
import React, { createElement, Component, FunctionComponent } from 'react';

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
}) => <Field
    { ...rest }
    render={ (props: FieldProps) => {
        const {
            field,
            form: { errors },
        } = props;

        return (
            <FormFieldContainer
                additionalClassName={ additionalClassName }
                testId={ testId }
                hasError={ getIn(errors, field.name) }
            >
                <FieldInput
                    { ...props }
                    onChange={ onChange }
                    component={ component }
                    render={ render }
                />
            </FormFieldContainer>
        );
    } }
/>;

type FieldInputProps = FieldProps & Pick<FieldConfig, 'component' | 'render'> & {
    onChange?(value: string): void;
};

class FieldInput extends Component<FieldInputProps> {
    componentDidUpdate({ field: prevField }: FieldInputProps) {
        const { field: { value }, onChange = noop } = this.props;
        const comparableValue = isDate(value) ? value.getTime() : value;
        const comparablePrevValue = isDate(prevField.value) ? prevField.value.getTime() : prevField.value;

        if (comparableValue !== comparablePrevValue) {
            onChange(value);
        }
    }

    render() {
        const {
            component = 'input',
            field,
            render,
        } = this.props;

        if (render) {
            // tslint:disable-next-line:no-unnecessary-type-assertion
            return (render as any)(this.props);
        }

        if (typeof component === 'string') {
            // tslint:disable-next-line:no-unnecessary-type-assertion
            return createElement(component as any, field);
        }

        // tslint:disable-next-line:no-unnecessary-type-assertion
        return createElement(component as any, this.props);
    }
}

export default BasicFormField;
