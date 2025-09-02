import React, { type FunctionComponent, memo } from 'react';

import './PopoverList.scss';

export interface PopoverListProps {
    menuProps?: React.HTMLAttributes<HTMLElement>;
    highlightedIndex?: number;
    getItemProps?: (index: number, itemId: string) => React.HTMLAttributes<HTMLElement>;
    items: PopoverListItem[];
    testId?: string;
}

export interface PopoverListItem {
    id: string;
    content: React.ReactChild[] | React.ReactChild;
}

const PopoverList: FunctionComponent<PopoverListProps> = ({
    highlightedIndex = -1,
    testId,
    getItemProps = () => ({}) as React.HTMLAttributes<HTMLElement>,
    menuProps = {},
    items,
}) => {
    if (!items.length) {
        return null;
    }

    return (
        <ul className="popoverList" data-test={testId} {...menuProps}>
            {items.map((item, index) => (
                <li
                    className={getItemClassName(highlightedIndex, index)}
                    data-test={testId && `${testId}-item`}
                    {...getItemProps(index, item.id)}
                    key={index}
                >
                    {item.content}
                </li>
            ))}
        </ul>
    );
};

function getItemClassName(highlightedIndex: number, index: number): string {
    const classes = ['popoverList-item'];

    if (highlightedIndex === index) {
        classes.push('is-active');
    }

    return classes.join(' ');
}

export default memo(PopoverList);
