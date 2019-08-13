import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { memoize } from '../../common/utility';

import AccordionContext from './AccordionContext';

export interface AccordionProps {
    children: ReactNode;
    className?: string;
    defaultSelectedItemId?: string;
    onSelect?(id: string): void;
}

export interface AccordionState {
    selectedItemId?: string;
}

export default class Accordion extends Component<AccordionProps, AccordionState> {
    state: AccordionState = {};

    private getContextValue = memoize(selectedItemId => {
        return {
            onToggle: this.handleToggleItem,
            selectedItemId,
        };
    });

    render(): ReactNode {
        const {
            children,
            className = 'accordion',
            defaultSelectedItemId,
        } = this.props;

        const { selectedItemId = defaultSelectedItemId } = this.state;

        return (
            <AccordionContext.Provider value={ this.getContextValue(selectedItemId) }>
                <ul className={ className }>
                    { children }
                </ul>
            </AccordionContext.Provider>
        );
    }

    private handleToggleItem: (id: string) => void = id => {
        const { onSelect = noop } = this.props;

        this.setState({ selectedItemId: id }, () => onSelect(id));
    };
}
