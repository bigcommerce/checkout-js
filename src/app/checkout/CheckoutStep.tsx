import classNames from 'classnames';
import { noop } from 'lodash';
import React, { createRef, Component, ReactNode, RefObject } from 'react';
import { CSSTransition } from 'react-transition-group';

import CheckoutStepHeader from './CheckoutStepHeader';
import CheckoutStepType from './CheckoutStepType';

export interface CheckoutStepProps {
    heading?: ReactNode;
    isActive?: boolean;
    isComplete?: boolean;
    isEditable?: boolean;
    shouldRenderEmptyContainer?: false; // TODO: Remove this once we are fully transitioned to React
    summary?: ReactNode;
    type: CheckoutStepType;
    onExpanded?(step: CheckoutStepType): void;
    onEdit?(step: CheckoutStepType): void;
}

// TODO: Remove this once we are fully transitioned to React
export interface EmptyCheckoutStepProps {
    isActive?: boolean;
    isComplete?: boolean;
    shouldRenderEmptyContainer: true;
}

const LARGE_SCREEN_BREAKPOINT = 968;
const LARGE_SCREEN_ANIMATION_DELAY = 610;

// TODO: Remove this once we are fully transitioned to React
function isEmptyCheckoutStepProps(props: CheckoutStepProps | EmptyCheckoutStepProps): props is EmptyCheckoutStepProps {
    return (props as EmptyCheckoutStepProps).shouldRenderEmptyContainer === true;
}

export default class CheckoutStep extends Component<CheckoutStepProps | EmptyCheckoutStepProps> {
    private containerRef: RefObject<HTMLElement> = createRef();
    private timeoutRef?: number;

    componentDidMount(): void {
        const { isActive } = this.props;

        if (isActive) {
            this.focusStep();
        }
    }

    componentDidUpdate(prevProps: Readonly<CheckoutStepProps>): void {
        const { isActive } = this.props;

        if (isActive && isActive !== prevProps.isActive) {
            this.focusStep();
        }
    }

    componentWillUnmount(): void {
        if (this.timeoutRef) {
            window.clearTimeout(this.timeoutRef);

            this.timeoutRef = undefined;
        }
    }

    render(): ReactNode {
        const { children } = this.props;

        // TODO: Remove this once we are fully transitioned to React
        if (isEmptyCheckoutStepProps(this.props)) {
            return (
                <div ref={ this.containerRef as RefObject<HTMLDivElement> }>
                    { children }
                </div>
            );
        }

        const {
            heading,
            isActive,
            isComplete,
            isEditable,
            onEdit,
            summary,
            type,
        } = this.props;

        return (
            <li
                className={ classNames(
                    'checkout-step',
                    'optimizedCheckout-checkoutStep',
                    { [`checkout-step--${type}`]: !!type }
                ) }
                ref={ this.containerRef as RefObject<HTMLLIElement> }
            >
                <div className="checkout-view-header">
                    <CheckoutStepHeader
                        heading={ heading }
                        isActive={ isActive }
                        isEditable={ isEditable }
                        isComplete={ isComplete }
                        onEdit={ onEdit }
                        summary={ summary }
                        type={ type }
                    />
                </div>

                <CSSTransition
                    addEndListener={ (node, done) => {
                        node.addEventListener('transitionend', ({ target }) => {
                            if (target === node) {
                                done();
                            }
                        });
                    } }
                    classNames="checkout-view-content"
                    timeout={ {} }
                    in={ isActive }
                    unmountOnExit
                    mountOnEnter
                >
                    <div className="checkout-view-content">
                        { children }
                    </div>
                </CSSTransition>
            </li>
        );
    }

    private focusStep(): void {
        const delay = window.innerWidth > LARGE_SCREEN_BREAKPOINT ? LARGE_SCREEN_ANIMATION_DELAY : 0;

        this.timeoutRef = window.setTimeout(() => {
            const input = this.getChildInput();
            const position = this.getScrollPosition();

            if (input) {
                input.focus();
            }

            if (position !== undefined && !isNaN(position)) {
                window.scrollTo(0, position);
            }

            if (!isEmptyCheckoutStepProps(this.props)) {
                const { type, onExpanded = noop } = this.props;

                onExpanded(type);
            }

            this.timeoutRef = undefined;
        }, delay);
    }

    private getChildInput(): HTMLElement | undefined {
        const container = this.containerRef.current;

        if (!container) {
            return;
        }

        const input = container.querySelector<HTMLElement>('input, select, textarea');

        return input ? input : undefined;
    }

    private getScrollPosition(): number | undefined {
        const container = this.getParentContainer();
        const { isComplete } = this.props;

        if (!container || window !== window.top) {
            return;
        }

        const topOffset = isComplete ? 0 : window.innerHeight / 5;
        const containerOffset = container.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);

        return containerOffset - topOffset;
    }

    // For now, we need to find the parent container because `CheckoutStep`
    // isn't the outer container yet. Once both the header and body are
    // moved inside this component, we can remove the lookup.
    private getParentContainer(): HTMLElement | undefined {
        let container: HTMLElement | null = this.containerRef.current;

        while (container && container.parentElement) {
            if (container.parentElement.classList.contains('checkout-step')) {
                return container.parentElement;
            }

            container = container.parentElement;
        }

        return this.containerRef.current ? this.containerRef.current : undefined;
    }
}
