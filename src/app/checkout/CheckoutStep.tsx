import classNames from 'classnames';
import { noop } from 'lodash';
import React, { createRef, Component, ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import { isMobileView, MobileView } from '../ui/responsive';

import CheckoutStepHeader from './CheckoutStepHeader';
import CheckoutStepType from './CheckoutStepType';

export interface CheckoutStepProps {
    heading?: ReactNode;
    isActive?: boolean;
    isComplete?: boolean;
    isEditable?: boolean;
    suggestion?: ReactNode;
    summary?: ReactNode;
    type: CheckoutStepType;
    onExpanded?(step: CheckoutStepType): void;
    onEdit?(step: CheckoutStepType): void;
}

export interface CheckoutStepState {
    isClosed: boolean;
}

export default class CheckoutStep extends Component<CheckoutStepProps, CheckoutStepState> {
    state = {
        isClosed: true,
    };

    private containerRef = createRef<HTMLLIElement>();
    private contentRef = createRef<HTMLDivElement>();
    private timeoutRef?: number;
    private timeoutDelay?: number;

    componentDidMount(): void {
        const { isActive } = this.props;

        if (isActive) {
            this.focusStep();
        }
    }

    componentDidUpdate(prevProps: Readonly<CheckoutStepProps>): void {
        const { isActive } = this.props;
        const { isClosed } = this.state;

        if (isActive && isActive !== prevProps.isActive) {
            this.focusStep();
        }

        if (!isActive && !isClosed && isMobileView()) {
            this.setState({ isClosed: true });
        }
    }

    componentWillUnmount(): void {
        if (this.timeoutRef) {
            window.clearTimeout(this.timeoutRef);

            this.timeoutRef = undefined;
        }
    }

    render(): ReactNode {
        const {
            heading,
            isActive,
            isComplete,
            isEditable,
            onEdit,
            suggestion,
            summary,
            type,
        } = this.props;

        const { isClosed } = this.state;

        return (
            <li
                className={ classNames(
                    'checkout-step',
                    'optimizedCheckout-checkoutStep',
                    { [`checkout-step--${type}`]: !!type }
                ) }
                ref={ this.containerRef }
            >
                <div className="checkout-view-header">
                    <CheckoutStepHeader
                        heading={ heading }
                        isActive={ isActive }
                        isComplete={ isComplete }
                        isEditable={ isEditable }
                        onEdit={ onEdit }
                        summary={ summary }
                        type={ type }
                    />
                </div>

                { suggestion && isClosed && !isActive && <div className="checkout-suggestion" data-test="step-suggestion">
                    { suggestion }
                </div> }

                { this.renderContent() }
            </li>
        );
    }

    private renderContent(): ReactNode {
        const { children, isActive } = this.props;

        return <>
            <MobileView>
                { matched => {
                    if (matched) {
                        return !isActive ? null : <div className="checkout-view-content">
                            { children }
                        </div>;
                    }

                    return <CSSTransition
                        addEndListener={ this.handleTransitionEnd }
                        classNames="checkout-view-content"
                        in={ isActive }
                        mountOnEnter
                        timeout={ {} }
                        unmountOnExit
                    >
                        <div
                            className="checkout-view-content"
                            ref={ this.contentRef }
                        >
                            { children }
                        </div>
                    </CSSTransition>;
                } }
            </MobileView>
        </>;
    }

    private focusStep(): void {
        const delay = isMobileView() ? 0 : this.getTransitionDelay();

        this.setState({ isClosed: false });

        this.timeoutRef = window.setTimeout(() => {
            const input = this.getChildInput();
            const position = this.getScrollPosition();
            const { type, onExpanded = noop } = this.props;

            if (input) {
                input.focus();
            }

            if (position !== undefined && !isNaN(position)) {
                window.scrollTo(0, position);
            }

            onExpanded(type);

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

    private getTransitionDelay(): number {
        if (this.timeoutDelay !== undefined) {
            return this.timeoutDelay;
        }

        // Cache the result to avoid unnecessary reflow
        this.timeoutDelay = parseFloat(this.contentRef.current ? getComputedStyle(this.contentRef.current).transitionDuration : '0s') * 1000;

        return this.timeoutDelay;
    }

    private handleTransitionEnd: (node: HTMLElement, done: () => void) => void = (node, done) => {
        const { isActive } = this.props;

        node.addEventListener('transitionend', ({ target }) => {
            if (target === node) {
                done();

                if (!isActive) {
                    this.setState({ isClosed: true });
                }
            }
        });
    };
}
