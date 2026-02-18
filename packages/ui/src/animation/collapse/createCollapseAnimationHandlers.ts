import type { RefObject } from 'react';

import { prefersReducedMotion } from '../prefersReducedMotion';

import type { CollapseAnimationHandlers } from './CollapseAnimationHandlers';

/**
 * Returns CSSTransition handlers for a height + opacity collapse (no vertical slide).
 * Use for coupon form and discounts collapsibles.
 */
export const createCollapseAnimationHandlers = (
    nodeRef: RefObject<HTMLElement | null>,
): CollapseAnimationHandlers => ({
    handleEnter: () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;
        node.style.height = '0px';
        node.style.opacity = '0';
    },
    handleEntering: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = `${node.scrollHeight}px`;
        node.style.opacity = '1';
    },
    handleEntered: () => {
        const node = nodeRef.current;

        if (!node) return;
        node.style.height = 'auto';
        node.style.opacity = '';
    },
    handleExit: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        node.style.height = `${node.offsetHeight}px`;
        node.style.opacity = '1';
    },
    handleExiting: () => {
        const node = nodeRef.current;

        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = '0px';
        node.style.opacity = '0';
    },
});
