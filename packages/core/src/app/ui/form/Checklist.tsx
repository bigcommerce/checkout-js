import { noop } from 'lodash';
import React, {
    createContext,
    FunctionComponent,
    memo,
    ReactNode,
    useCallback,
    useMemo,
} from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { Accordion } from '../accordion';

export interface ChecklistProps {
    children: ReactNode;
    defaultSelectedItemId?: string;
    isDisabled?: boolean;
    name: string;
    onSelect?(value: string): void;
}

export interface ChecklistContextProps {
    name: string;
}

export const ChecklistContext = createContext<ChecklistContextProps | undefined>(undefined);

const Checklist: FunctionComponent<
    ChecklistProps & ConnectFormikProps<{ [key: string]: string }>
> = ({ formik: { setFieldValue }, name, onSelect = noop, ...props }) => {
    const handleSelect = useCallback(
        (value: string) => {
            setFieldValue(name, value);
            onSelect(value);
        },
        [name, onSelect, setFieldValue],
    );

    const contextValue = useMemo(() => ({ name }), [name]);

    return (
        <ChecklistContext.Provider value={contextValue}>
            <Accordion
                {...props}
                className="form-checklist optimizedCheckout-form-checklist"
                onSelect={handleSelect}
            />
        </ChecklistContext.Provider>
    );
};

export default connectFormik(memo(Checklist));
