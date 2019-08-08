import { kebabCase } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';

import { AccordionItem } from '../accordion';

import BasicFormField from './BasicFormField';
import { ChecklistContext } from './Checklist';
import ChecklistItemInput from './ChecklistItemInput';

export interface ChecklistItemProps {
    content?: ReactNode;
    htmlId?: string;
    label: ReactNode | ((isSelected: boolean) => ReactNode);
    value: string;
}

const ChecklistItem: FunctionComponent<ChecklistItemProps> = ({
    value,
    content,
    htmlId = kebabCase(value),
    label,
    ...rest
}) => (
    <ChecklistContext.Consumer>
        { context => {
            if (!context) {
                throw new Error('`Checklist` component should provide `name` prop.');
            }

            return (
                <AccordionItem
                    { ...rest }
                    bodyClassName="form-checklist-body"
                    className="form-checklist-item optimizedCheckout-form-checklist-item"
                    classNameSelected="form-checklist-item--selected optimizedCheckout-form-checklist-item--selected"
                    headerClassName="form-checklist-header"
                    headerClassNameSelected="form-checklist-header--selected"
                    headerContent={ ({ onToggle, isSelected }) => (
                        <BasicFormField
                            className="form-checklist-option"
                            name={ context.name }
                            onChange={ selectedValue => {
                                if (value === selectedValue) {
                                    onToggle(value);
                                }
                            } }
                            render={ ({ field }) => (
                                <ChecklistItemInput
                                    { ...field }
                                    isSelected={ field.value === value }
                                    id={ htmlId }
                                    value={ value }
                                >
                                    { label instanceof Function ? label(isSelected) : label }
                                </ChecklistItemInput>
                            ) }
                        />
                    ) }
                    itemId={ value }
                >
                    { content }
                </AccordionItem>
            );
        } }
    </ChecklistContext.Consumer>
);

export default ChecklistItem;
