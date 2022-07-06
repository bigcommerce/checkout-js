import { isFunction, noop } from 'lodash';
import React, { createContext, memo, useMemo, useState, FunctionComponent, ReactNode } from 'react';

export interface FormContextType {
    isSubmitted: boolean;
    setSubmitted(isSubmitted: boolean): void;
}

type FormContextFunction = (props: FormContextType) => ReactNode;

export interface FormProviderProps {
    initialIsSubmitted?: boolean;
    children: ReactNode | FormContextFunction;
}

export const FormContext = createContext<FormContextType>({
    isSubmitted: false,
    setSubmitted: noop,
});

const FormProvider: FunctionComponent<FormProviderProps> = ({
    children,
    initialIsSubmitted = false,
}) => {
    const [ isSubmitted, setSubmitted ] = useState(initialIsSubmitted);
    const contextValue = useMemo(() => ({ isSubmitted, setSubmitted }), [isSubmitted]);

    return (
        <FormContext.Provider value={ contextValue }>
            { isFunction(children) ?
                children({ isSubmitted, setSubmitted }) :
                children }
        </FormContext.Provider>
    );
};

export default memo(FormProvider);
