import React, { Fragment, type ReactChild } from 'react';

import { type PopoverListItem } from '../popover';

import type AutocompleteItem from './autocomplete-item';

export const highlightItem = (item: AutocompleteItem): ReactChild[] | ReactChild => {
    if (!item.highlightedSlices || !item.highlightedSlices.length) {
        return item.label;
    }

    let lastIndex = 0;
    let key = 0;

    return item.highlightedSlices.reduce((node, slice, i) => {
        const { label } = item;
        const { offset, length } = slice;
        const notHighlightedLength = offset - lastIndex;

        if (notHighlightedLength) {
            node.push(
                <Fragment key={key}>{label.substr(lastIndex, notHighlightedLength)}</Fragment>,
            );
            key += 1;
        }

        lastIndex = offset + length;

        node.push(<strong key={key}>{label.substr(offset, length)}</strong>);
        key += 1;

        if (i === (item.highlightedSlices || []).length - 1) {
            node.push(<Fragment key={key}>{label.substr(lastIndex)}</Fragment>);
            key += 1;
        }

        return node;
        // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, [] as ReactChild[]);
};

export const toPopoverItem = (item: AutocompleteItem): PopoverListItem => {
    return {
        ...item,
        content: highlightItem(item),
    };
};

export const itemToString = (item?: AutocompleteItem | null): string => {
    return (item && item.value) || '';
};
