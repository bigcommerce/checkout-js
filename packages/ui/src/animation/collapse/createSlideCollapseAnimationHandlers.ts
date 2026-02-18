import type { RefObject } from 'react';

import { SLIDE_DISTANCE } from '../constants';
import { prefersReducedMotion } from '../prefersReducedMotion';

import type { CollapseAnimationHandlers } from './CollapseAnimationHandlers';

/**
 * Returns CSSTransition handlers for a height + opacity + vertical slide collapse.
 * Use for order summary product list items and coupon tags.
 */
export const createSlideCollapseAnimationHandlers = (
    nodeRef: RefObject<HTMLElement | null>,
): CollapseAnimationHandlers => ({
    handleEnter: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
        node.style.overflow = 'hidden';
    },
    handleEntering: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = `${node.scrollHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
    },
    handleEntered: () => {
        const node = nodeRef.current;

        if (!node) return;
        node.style.height = '';
        node.style.opacity = '';
        node.style.transform = '';
        node.style.overflow = '';
    },
    handleExit: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        node.style.height = `${node.offsetHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
        node.style.overflow = 'hidden';
    },
    handleExiting: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
    },
});
