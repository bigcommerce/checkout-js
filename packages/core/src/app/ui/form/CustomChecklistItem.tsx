import React, { type FunctionComponent, memo, type ReactNode } from 'react';

export interface CustomChecklistItemProps {
    content?: ReactNode;
    htmlId?: string;
}

const CustomChecklistItem: FunctionComponent<CustomChecklistItemProps> = ({
    content,
    htmlId,
}) => {
    return (
        <li
            className="form-checklist-item optimizedCheckout-form-checklist-item custom-checklist-item"
            id={htmlId}
        >
            {content}
        </li>
    );
};

export default memo(CustomChecklistItem);
