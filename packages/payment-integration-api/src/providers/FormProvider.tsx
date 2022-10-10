import { isFunction } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useMemo, useState } from 'react';

import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

export interface FormProviderProps {
    initialIsSubmitted?: boolean;
    children: ReactNode | FormContextFunction;
}

type FormContextFunction = (props: FormContextType) => ReactNode;

const FormProvider: FunctionComponent<FormProviderProps> = ({
    children,
    initialIsSubmitted = false,
}) => {
    const [isSubmitted, setSubmitted] = useState(initialIsSubmitted);
    const contextValue = useMemo(() => ({ isSubmitted, setSubmitted }), [isSubmitted]);

    return (
        <FormContext.Provider value={contextValue}>
            {isFunction(children) ? children({ isSubmitted, setSubmitted }) : children}
        </FormContext.Provider>
    );
};

export default memo(FormProvider);
