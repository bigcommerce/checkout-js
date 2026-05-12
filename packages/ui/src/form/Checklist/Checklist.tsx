import { useFormikContext } from 'formik';
import { noop } from 'lodash';
import React, {
    createContext,
    type FunctionComponent,
    memo,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
} from 'react';

import { Accordion } from '../../accordion';

export interface ChecklistProps {
    children?: ReactNode;
    defaultSelectedItemId?: string;
    isDisabled?: boolean;
    name: string;
    onSelect?(value: string): void;
}

export interface ChecklistContextProps {
    name: string;
}

export const ChecklistContext = createContext<ChecklistContextProps | undefined>(undefined);

export const Checklist: FunctionComponent<ChecklistProps> = ({
    name,
    onSelect = noop,
    ...props
}) => {
    const { setFieldValue } = useFormikContext();

    useEffect(() => {
        return () => {
            void setFieldValue(name, '');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelect = useCallback(
        (value: string) => {
            void setFieldValue(name, value);
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

export default memo(Checklist);
