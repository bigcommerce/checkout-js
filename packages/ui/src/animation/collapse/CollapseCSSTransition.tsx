import React, { type ReactNode, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';

import { ANIMATION_DURATION } from '../constants';

import { createCollapseAnimationHandlers } from './createCollapseAnimationHandlers';
import { createSlideCollapseAnimationHandlers } from './createSlideCollapseAnimationHandlers';

export interface CollapseCSSTransitionProps {
    appear?: boolean;
    children: ReactNode;
    classNames?: string;
    in?: boolean;
    isSlideAnimation?: boolean;
    isVisible?: boolean;
    nodeRef: React.RefObject<HTMLElement | null>;
    onExited?: () => void;
    unmountOnExit?: boolean;
}

/**
 * Wraps content in a CSSTransition with collapse animation.
 * When isSlideAnimation is true, adds a vertical slide (translateY) to the collapse.
 * The single child element should receive the same ref as nodeRef.
 */
export const CollapseCSSTransition = ({
    appear = false,
    children,
    classNames,
    in: inProp,
    isSlideAnimation = false,
    isVisible,
    nodeRef,
    onExited,
    unmountOnExit = true,
}: CollapseCSSTransitionProps) => {
    const handlers = useMemo(
        () =>
            isSlideAnimation
                ? createSlideCollapseAnimationHandlers(nodeRef)
                : createCollapseAnimationHandlers(nodeRef),
        [isSlideAnimation, nodeRef],
    );

    return (
        <CSSTransition
            appear={appear}
            classNames={classNames}
            in={inProp ?? isVisible}
            nodeRef={nodeRef}
            onEnter={handlers.handleEnter}
            onEntered={handlers.handleEntered}
            onEntering={handlers.handleEntering}
            onExit={handlers.handleExit}
            onExited={onExited}
            onExiting={handlers.handleExiting}
            timeout={ANIMATION_DURATION}
            unmountOnExit={unmountOnExit}
        >
            {children}
        </CSSTransition>
    );
};
