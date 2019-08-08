import { noop } from 'lodash';
import React, { createContext, FunctionComponent, ReactNode } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { Accordion } from '../accordion';

export interface ChecklistProps {
    children: ReactNode;
    defaultSelectedItemId?: string;
    name: string;
    onSelect?(value: string): void;
}

export interface ChecklistContextProps {
    name: string;
}

export const ChecklistContext = createContext<ChecklistContextProps | undefined>(undefined);

const Checklist: FunctionComponent<ChecklistProps & ConnectFormikProps<{ [key: string]: string }>> = ({
    formik: { setFieldValue },
    name,
    onSelect = noop,
    ...props
}) => (
    <ChecklistContext.Provider value={ { name } }>
        <Accordion
            { ...props }
            className="form-checklist optimizedCheckout-form-checklist"
            onSelect={ value => {
                setFieldValue(name, value);
                onSelect(value);
            } }
        />
    </ChecklistContext.Provider>
);

export default connectFormik(Checklist);
