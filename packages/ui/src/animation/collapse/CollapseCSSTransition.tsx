import React, { type ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import { ANIMATION_DURATION } from '../constants';

import { createCollapseAnimationHandlers } from './createCollapseAnimationHandlers';

export interface CollapseCSSTransitionProps {
    children: ReactNode;
    isVisible: boolean;
    nodeRef: React.RefObject<HTMLElement | null>;
    unmountOnExit?: boolean;
}

/**
 * Wraps content in a CSSTransition with collapse (height + opacity) animation.
 * The single child element should receive the same ref as nodeRef.
 */
export const CollapseCSSTransition = ({
    children,
    isVisible,
    nodeRef,
    unmountOnExit = true,
}: CollapseCSSTransitionProps) => {
    const collapseHandlers = createCollapseAnimationHandlers(nodeRef);

    return (
        <CSSTransition
            in={isVisible}
            nodeRef={nodeRef}
            onEnter={collapseHandlers.handleEnter}
            onEntered={collapseHandlers.handleEntered}
            onEntering={collapseHandlers.handleEntering}
            onExit={collapseHandlers.handleExit}
            onExiting={collapseHandlers.handleExiting}
            timeout={ANIMATION_DURATION}
            unmountOnExit={unmountOnExit}
        >
            {children}
        </CSSTransition>
    );
};
