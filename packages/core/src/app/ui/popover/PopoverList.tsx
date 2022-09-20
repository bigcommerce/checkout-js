import React, { FunctionComponent, memo } from 'react';

import './PopoverList.scss';

export interface PopoverListProps {
    menuProps?: any;
    highlightedIndex?: number;
    getItemProps?: any;
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
     
    getItemProps = (props: any) => props,
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
                     
                    {...getItemProps({
                        key: item.id,
                        index,
                        item,
                    })}
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
