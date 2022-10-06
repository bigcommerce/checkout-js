import { noop } from 'lodash';
import { createContext } from 'react';

export interface FormContextType {
    isSubmitted: boolean;
    setSubmitted(isSubmitted: boolean): void;
}

const FormContext = createContext<FormContextType>({
    isSubmitted: false,
    setSubmitted: noop,
});

export default FormContext;
