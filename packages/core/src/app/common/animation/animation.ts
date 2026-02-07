/**
 * Shared constants and helpers for order-summary transition animations
 * (coupon tags, product items, expand/collapse sections).
 */

import type { RefObject } from 'react';

export const ANIMATION_DURATION = 300;

export const SLIDE_DISTANCE = 12;

/**
 * Returns true when the user has requested reduced motion (accessibility).
 */
export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface CollapseAnimationHandlers {
    handleEnter: () => void;
    handleEntered: () => void;
    handleEntering: () => void;
    handleExit: () => void;
    handleExiting: () => void;
}

/**
 * Returns CSSTransition handlers for a height + opacity collapse (no vertical slide).
 * Use for coupon form and discounts collapsibles.
 */
export const createCollapseAnimationHandlers = (
    nodeRef: RefObject<HTMLElement | null>
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

/**
 * Returns CSSTransition handlers for a height + opacity + vertical slide collapse.
 * Use for order summary product list items.
 */
export const createSlideCollapseAnimationHandlers = (
    nodeRef: RefObject<HTMLElement | null>
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
