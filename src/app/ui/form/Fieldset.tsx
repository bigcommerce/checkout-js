import classNames from 'classnames';
import React, { forwardRef, FieldsetHTMLAttributes, ReactNode, Ref } from 'react';

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
    additionalClassName?: string;
    testId?: string;
    legend?: ReactNode;
}

const Fieldset = forwardRef((
    {
        additionalClassName,
        children,
        className,
        legend,
        testId,
        ...rest
    }: FieldsetProps,
    ref: Ref<HTMLFieldSetElement>
) => (
    <fieldset
        { ...rest }
        className={ className ? className : classNames(
            'form-fieldset',
            additionalClassName
        ) }
        data-test={ testId }
        ref={ ref }
    >
        { legend }

        <div className="form-body">
            { children }
        </div>
    </fieldset>
));

export default Fieldset;
