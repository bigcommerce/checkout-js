import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import AccordionContext from './AccordionContext';

export interface AccordionItemProps {
    bodyClassName?: string;
    className?: string;
    classNameSelected?: string;
    headerClassName?: string;
    headerClassNameSelected?: string;
    itemId: string;
    headerContent(props: AccordionItemHeaderProps): ReactNode;
}

export interface AccordionItemHeaderProps {
    isSelected: boolean;
    onToggle(id: string): void;
}

const AccordionItem: FunctionComponent<AccordionItemProps> = ({
    bodyClassName = 'accordion-item-body',
    children,
    className = 'accordion-item',
    classNameSelected = 'accordion-item--selected',
    headerClassName = 'accordion-item-header',
    headerClassNameSelected = 'accordion-item-header--selected',
    headerContent,
    itemId,
}) => (
    <AccordionContext.Consumer>
        { ({ onToggle, selectedItemId }) => {
            const isSelected = selectedItemId === itemId;

            return (
                <li className={ classNames(
                    className,
                    { [classNameSelected]: isSelected }
                ) }>
                    <div className={ classNames(
                        headerClassName,
                        { [headerClassNameSelected]: isSelected }
                    ) }>
                        { headerContent({ isSelected, onToggle }) }
                    </div>

                    { children && <CSSTransition
                        addEndListener={ (node, done) => {
                            node.addEventListener('transitionend', ({ target }) => {
                                if (target === node) {
                                    done();
                                }
                            });
                        } }
                        classNames={ bodyClassName }
                        timeout={ {} }
                        in={ isSelected }
                        unmountOnExit
                        mountOnEnter
                    >
                        <div className={ bodyClassName }>
                            { children }
                        </div>
                    </CSSTransition> }
                </li>
            );
        } }
    </AccordionContext.Consumer>
);

export default AccordionItem;
