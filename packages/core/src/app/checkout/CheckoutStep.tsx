import classNames from 'classnames';
import { noop } from 'lodash';
import React, { type ReactElement, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { isMobileView, MobileView } from '../ui/responsive';

import CheckoutStepHeader from './CheckoutStepHeader';
import type CheckoutStepType from './CheckoutStepType';

export interface CheckoutStepProps {
    children?: ReactNode;
    heading?: ReactNode;
    isActive?: boolean;
    isBusy: boolean;
    isComplete?: boolean;
    isEditable?: boolean;
    suggestion?: ReactNode;
    summary?: ReactNode;
    type: CheckoutStepType;
    onExpanded?(step: CheckoutStepType): void;
    onEdit?(step: CheckoutStepType): void;
}

const CheckoutStep = ({
        children,
        heading,
        isActive,
        isBusy,
        isComplete,
        isEditable,
        onEdit,
        suggestion,
        summary,
        type,
        onExpanded = noop,
    }: CheckoutStepProps): ReactElement => {
    const [isClosed, setIsClosed] = useState(true);

    const containerRef = useRef<HTMLLIElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number>();
    const timeoutDelay = useRef<number>();

    const getChildInput = (): HTMLElement | undefined => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const input = container.querySelector<HTMLElement>('input, select, textarea');

        return input || undefined;
    };

    const getScrollPosition = (): number | undefined => {
        const container = getParentContainer();

        if (!container || window !== window.top) {
            return;
        }

        const topOffset = isComplete ? 0 : window.innerHeight / 5;
        const containerOffset =
            container.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);

        return containerOffset - topOffset;
    };

    // For now, we need to find the parent container because `CheckoutStep`
    // isn't the outer container yet. Once both the header and body are
    // moved inside this component, we can remove the lookup.
    const getParentContainer = (): HTMLElement | undefined => {
        let container: HTMLElement | null = containerRef.current;

        while (container && container.parentElement) {
            if (container.parentElement.classList.contains('checkout-step')) {
                return container.parentElement;
            }

            container = container.parentElement;
        }

        return containerRef.current ? containerRef.current : undefined;
    };

    const getTransitionDelay = (): number => {
        if (timeoutDelay.current !== undefined) {
            return timeoutDelay.current;
        }

        timeoutDelay.current =
            parseFloat(
                contentRef.current
                    ? getComputedStyle(contentRef.current).transitionDuration
                    : '0s',
            ) * 1000;

        return timeoutDelay.current;
    };

    const focusStep = (): void => {
        const delay = isMobileView() ? 0 : getTransitionDelay();

        setIsClosed(false);

        timeoutRef.current = window.setTimeout(() => {
            const input = getChildInput();
            const position = getScrollPosition();

            if (input) {
                input.focus();
            }

            if (position !== undefined && !isNaN(position)) {
                window.scrollTo(0, position);
            }

            onExpanded(type);

            timeoutRef.current = undefined;
        }, delay);
    };

    const handleTransitionEnd = (node: HTMLElement, done: () => void): void => {
        node.addEventListener('transitionend', ({ target }) => {
            if (target === node) {
                done();
            }
        });
    };

    const onAnimationEnd = useCallback((): void => {
        if (!isActive) {
            setIsClosed(true);
        }
    }, [isActive]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = undefined;
            }
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            focusStep();
        }
    }, [isActive]);

    return (
        <li
            className={classNames('checkout-step', 'optimizedCheckout-checkoutStep', {
                [`checkout-step--${type}`]: !!type,
            })}
            ref={containerRef}
        >
            <div className="checkout-view-header">
                <CheckoutStepHeader
                    heading={heading}
                    isActive={isActive}
                    isComplete={isComplete}
                    isEditable={isEditable}
                    onEdit={onEdit}
                    summary={summary}
                    type={type}
                />
            </div>

            {suggestion && isClosed && !isActive && (
                <div className="checkout-suggestion" data-test="step-suggestion">
                    {suggestion}
                </div>
            )}

            <MobileView>
                {(matched) => (
                    <CSSTransition
                        addEndListener={handleTransitionEnd}
                        classNames="checkout-view-content"
                        enter={!matched}
                        exit={!matched}
                        in={isActive}
                        mountOnEnter
                        onExited={onAnimationEnd}
                        timeout={{}}
                        unmountOnExit
                    >
                        <div
                            aria-busy={isBusy}
                            className="checkout-view-content"
                            ref={contentRef}
                        >
                            {isActive ? children : null}
                        </div>
                    </CSSTransition>
                )}
            </MobileView>
        </li>
    );
};

export default CheckoutStep;
