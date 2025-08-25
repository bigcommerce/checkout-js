import classNames from 'classnames';
import React, {
    type FunctionComponent,
    memo,
    type ReactNode,
    useCallback,
    useContext,
} from 'react';
import { CSSTransition } from 'react-transition-group';

import AccordionContext from './AccordionContext';

export interface AccordionItemProps {
    bodyClassName?: string;
    children?: ReactNode;
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
}) => {
    const { onToggle, selectedItemId } = useContext(AccordionContext);
    const isSelected = selectedItemId === itemId;

    const transitionEndListener = useCallback((node: Node, done: () => void) => {
        node.addEventListener('transitionend', ({ target }: Event) => {
            if (target === node) {
                done();
            }
        });
    }, []);

    return (
        <li className={classNames(className, { [classNameSelected]: isSelected })}>
            <div className={classNames(headerClassName, { [headerClassNameSelected]: isSelected })}>
                {headerContent({ isSelected, onToggle })}
            </div>

            {children ? (
                <CSSTransition
                    addEndListener={transitionEndListener}
                    classNames={bodyClassName}
                    in={isSelected}
                    mountOnEnter
                    timeout={{}}
                    unmountOnExit
                >
                    <div aria-live="polite" className={bodyClassName}>
                        {children}
                    </div>
                </CSSTransition>
            ) : null}
        </li>
    );
};

export default memo(AccordionItem);
