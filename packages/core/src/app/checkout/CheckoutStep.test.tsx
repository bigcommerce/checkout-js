import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { MOBILE_MAX_WIDTH } from '../ui/responsive';

import CheckoutStep, { type CheckoutStepProps } from './CheckoutStep';
import CheckoutStepType from './CheckoutStepType';

jest.useFakeTimers({ legacyFakeTimers: true });

describe('CheckoutStep', () => {
    let defaultProps: CheckoutStepProps;
    let isMobile: boolean;

    const scrollTo = window.scrollTo;
    const matchMedia = window.matchMedia;

    beforeEach(() => {
        defaultProps = {
            isBusy: false,
            isActive: true,
            type: CheckoutStepType.Customer,
            onExpanded: jest.fn()
        };

        isMobile = false;

        // JSDOM does not support `scrollTo`
        window.scrollTo = jest.fn();

        // Mock `matchMedia` to detect mobile viewport
        window.matchMedia = jest.fn(
            (query) =>
                ({
                    matches:
                        query === `screen and (max-width: ${MOBILE_MAX_WIDTH}px)`
                            ? isMobile
                            : false,
                    addListener: noop,
                    addEventListener: noop,
                    removeListener: noop,
                    removeEventListener: noop,
                } as MediaQueryList),
        );
    });

    afterEach(() => {
        window.scrollTo = scrollTo;
        window.matchMedia = matchMedia;

        // Reset the focused element after each test
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
    });

    it('focuses on first form input when step is active', async () => {
        render(
            <CheckoutStep {...defaultProps}>
                <input data-test="first-input" type="text" />
                <input type="number"/>
            </CheckoutStep>
        );

        jest.runAllTimers();

        expect(screen.getByTestId('first-input')).toHaveFocus();
    });

    it('calls onExpanded when step is active', () => {
        render(<CheckoutStep {...defaultProps} />);

        jest.runAllTimers();

        expect(defaultProps.onExpanded).toHaveBeenCalledWith('customer');
    });

    it('scrolls to container when step is active', () => {
        const { container } = render(<CheckoutStep {...defaultProps} />);

        jest.runAllTimers();

        const expectedPosition =
            container.offsetHeight +
            window.scrollY -
            window.innerHeight / 5;

        expect(window.scrollTo).toHaveBeenCalledWith(0, expectedPosition);
    });

    it('scrolls to container after timeout', () => {
        render(<CheckoutStep {...defaultProps} />);

        expect(window.scrollTo).not.toHaveBeenCalled();

        jest.runAllTimers();

        expect(window.scrollTo).toHaveBeenCalled();
    });

    it('does not scroll to element if step is not active', () => {
        render(
            <CheckoutStep {...defaultProps} isActive={false}>
                <input type="text" />
                <input type="number" />
            </CheckoutStep>,
        );

        jest.runAllTimers();

        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('renders step header with required props', () => {
        const headerProps = {
            heading: 'Billing',
            summary: 'Billing summary',
            type: CheckoutStepType.Billing,
            isActive: true,
            isComplete: true,
            isEditable: true,
            onEdit: undefined,
        };

        render(<CheckoutStep {...defaultProps} {...headerProps} />);

        expect(screen.getByText(headerProps.heading)).toBeInTheDocument();
    });

    it('renders content if step is active', () => {
        render(<CheckoutStep {...defaultProps}>Hello world</CheckoutStep>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('does not render content if step is not active', () => {
        render(
            <CheckoutStep {...defaultProps} isActive={false}>
                Hello world
            </CheckoutStep>,
        );

        expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
    });

    it('renders suggestion if step is inactive', () => {
        render(
            <CheckoutStep {...defaultProps} isActive={false} suggestion="Billing suggestion" />,
        );

        expect(screen.getByTestId('step-suggestion')).toHaveTextContent('Billing suggestion')
    });

    it('does not render suggestion if step is active', () => {
        render(
            <CheckoutStep {...defaultProps} suggestion="Billing suggestion" />,
        );

        expect(screen.queryByTestId('step-suggestion')).not.toBeInTheDocument();
    });

    it('does not render suggestion if its not provided', () => {
        render(
            <CheckoutStep {...defaultProps} isActive={false} suggestion={undefined} />,
        );

        expect(screen.queryByTestId('step-suggestion')).not.toBeInTheDocument();
    });

    it('returns undefined for scroll position when window is not the top window', () => {
        render(<CheckoutStep {...defaultProps} />);

        Object.defineProperty(window, 'top', {
            value: {},
            writable: true,
        });

        expect(window.scrollTo).not.toHaveBeenCalled();
    });

});
