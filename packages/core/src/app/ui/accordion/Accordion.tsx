import { memoizeOne } from '@bigcommerce/memoize';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import AccordionContext from './AccordionContext';

export interface AccordionProps {
    children: ReactNode;
    className?: string;
    defaultSelectedItemId?: string;
    isDisabled?: boolean;
    onSelect?(id: string): void;
}

export interface AccordionState {
    selectedItemId?: string;
}

export default class Accordion extends Component<AccordionProps, AccordionState> {
    state: AccordionState = {};

    private getContextValue = memoizeOne((selectedItemId) => {
        return {
            onToggle: this.handleToggleItem,
            selectedItemId,
        };
    });

    render(): ReactNode {
        const { children, className = 'accordion', defaultSelectedItemId } = this.props;

        const { selectedItemId = defaultSelectedItemId } = this.state;

        return (
            <AccordionContext.Provider value={this.getContextValue(selectedItemId)}>
                <ul className={className}>{children}</ul>
            </AccordionContext.Provider>
        );
    }

    private handleToggleItem: (id: string) => void = (id) => {
        const { isDisabled, onSelect = noop } = this.props;

        if (isDisabled) {
            return;
        }

        this.setState({ selectedItemId: id });
        onSelect(id);
    };
}
