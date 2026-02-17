import React, { type ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import { ANIMATION_DURATION } from '../constants';

import { createSlideCollapseAnimationHandlers } from './createSlideCollapseAnimationHandlers';

export interface SlideCollapseCSSTransitionProps {
    appear?: boolean;
    children: ReactNode;
    classNames?: string;
    in?: boolean;
    nodeRef: React.RefObject<HTMLElement | null>;
    onExited?: () => void;
    unmountOnExit?: boolean;
}

/**
 * Wraps content in a CSSTransition with slide + collapse (height, opacity, transform) animation.
 * Use for product list items and coupon tags. The single child element should receive the same ref as nodeRef.
 */
export const SlideCollapseCSSTransition = ({
    appear = false,
    children,
    classNames,
    in: inProp,
    nodeRef,
    onExited,
    unmountOnExit = true,
}: SlideCollapseCSSTransitionProps) => {
    const slideHandlers = createSlideCollapseAnimationHandlers(nodeRef);

    return (
        <CSSTransition
            appear={appear}
            classNames={classNames}
            in={inProp}
            nodeRef={nodeRef}
            onEnter={slideHandlers.handleEnter}
            onEntered={slideHandlers.handleEntered}
            onEntering={slideHandlers.handleEntering}
            onExit={slideHandlers.handleExit}
            onExited={onExited}
            onExiting={slideHandlers.handleExiting}
            timeout={ANIMATION_DURATION}
            unmountOnExit={unmountOnExit}
        >
            {children}
        </CSSTransition>
    );
};
