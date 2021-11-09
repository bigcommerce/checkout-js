import { mount, shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';
import { CSSTransition } from 'react-transition-group';

import { isMobileView, MOBILE_MAX_WIDTH } from '../ui/responsive';

import CheckoutStep, { CheckoutStepProps } from './CheckoutStep';
import CheckoutStepHeader from './CheckoutStepHeader';
import CheckoutStepType from './CheckoutStepType';

jest.useFakeTimers();
jest.mock('../ui/responsive', () => {
    const original = jest.requireActual('../ui/responsive');

    return {
        ...original,
        isMobileView: jest.fn(),
    };
});

describe('CheckoutStep', () => {
    let defaultProps: CheckoutStepProps;
    let isMobile: boolean;

    beforeEach(() => {
        defaultProps = {
            isActive: true,
            type: CheckoutStepType.Customer,
            onExpanded: jest.fn(),
        };

        isMobile = false;

        // JSDOM does not support `scrollTo`
        window.scrollTo = jest.fn();

        // Mock `matchMedia` to detect mobile viewport
        window.matchMedia = jest.fn(query => ({
            matches: query === `screen and (max-width: ${MOBILE_MAX_WIDTH}px)` ? isMobile : false,
            addListener: noop,
            addEventListener: noop,
            removeListener: noop,
            removeEventListener: noop,
        }) as MediaQueryList);
    });

    afterEach(() => {
        delete window.scrollTo;
        delete window.matchMedia;

        // Reset the focused element after each test
        if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
        }
    });

    it('focuses on first form input when step is active', () => {
        const component = mount(
            <CheckoutStep { ...defaultProps }>
                <input type="text" />
                <input type="number" />
            </CheckoutStep>
        );

        jest.runAllTimers();

        expect(component.getDOMNode().querySelector('input'))
            .toEqual(document.activeElement);
    });

    it('calls onExpanded when step is active', () => {
        mount(<CheckoutStep { ...defaultProps } />);

        jest.runAllTimers();

        expect(defaultProps.onExpanded)
            .toHaveBeenCalledWith('customer');
    });

    it('scrolls to container when step is active', () => {
        const component = mount(
            <CheckoutStep { ...defaultProps } />
        );

        jest.runAllTimers();

        const expectedPosition = component.getDOMNode().getBoundingClientRect().top + window.scrollY - window.innerHeight / 5;

        expect(window.scrollTo)
            .toHaveBeenCalledWith(0, expectedPosition);
    });

    it('scrolls to container after timeout', () => {
        mount(<CheckoutStep { ...defaultProps } />);

        expect(window.scrollTo)
            .not.toHaveBeenCalled();

        jest.runAllTimers();

        expect(window.scrollTo)
            .toHaveBeenCalled();
    });

    it('does not focus or scroll to element if step is not active', () => {
        const component = mount(
            <CheckoutStep
                { ...defaultProps }
                isActive={ false }
            >
                <input type="text" />
                <input type="number" />
            </CheckoutStep>
        );

        jest.runAllTimers();

        expect(component.getDOMNode().querySelector('input'))
            .not.toEqual(document.activeElement);

        expect(window.scrollTo)
            .not.toHaveBeenCalled();
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

        const component = mount(
            <CheckoutStep
                { ...defaultProps }
                { ...headerProps }
            />
        );

        expect(component.find(CheckoutStepHeader))
            .toHaveLength(1);

        expect(component.find(CheckoutStepHeader).props())
            .toEqual({ ...headerProps });
    });

    it('renders content if step is active', () => {
        const component = mount(
            <CheckoutStep { ...defaultProps }>
                Hello world
            </CheckoutStep>
        );

        expect(component.exists('.checkout-view-content'))
            .toEqual(true);

        expect(component.find('.checkout-view-content').text())
            .toEqual('Hello world');
    });

    it('does not render content if step is not active', () => {
        const component = mount(
            <CheckoutStep
                { ...defaultProps }
                isActive={ false }
            >
                Hello world
            </CheckoutStep>
        );

        expect(component.exists('.checkout-view-content'))
            .toEqual(false);
    });

    it('animates using CSS transition in desktop view', () => {
        const component = mount(<CheckoutStep { ...defaultProps } />);

        expect(component.find(CSSTransition))
            .toHaveLength(1);
    });

    it('does not animate using CSS transition in mobile view', () => {
        isMobile = true;

        const component = mount(<CheckoutStep { ...defaultProps } />);

        expect(component.find(CSSTransition))
            .toHaveLength(0);
    });

    it('changes isClosed for mobile', () => {
        isMobile = true;
        isMobileView.mockImplementation(() => isMobile);

        const component = mount(<CheckoutStep { ...defaultProps } />);

        expect(component.state('isClosed')).toBe(false);

        component
            .setProps({ isActive: false })
            .update();

        expect(component.state('isClosed')).toBe(true);
    });

    it('renders suggestion if step is inactive', () => {
        const component = shallow(
            <CheckoutStep
                { ...defaultProps }
                isActive={ false }
                suggestion="Billing suggestion"
            />
        );

        expect(component.find('[data-test="step-suggestion"]').text())
            .toEqual('Billing suggestion');
    });

    it('does not render suggestion if step is active', () => {
        const component = shallow(
            <CheckoutStep
                { ...defaultProps }
                suggestion="Billing suggestion"
            />
        );

        expect(component.exists('[data-test="step-suggestion"]'))
            .toEqual(false);
    });

    it('does not render suggestion if its not provided', () => {
        const component = shallow(
            <CheckoutStep
                { ...defaultProps }
                isActive={ false }
                suggestion={ undefined }
            />
        );

        expect(component.exists('[data-test="step-suggestion"]'))
            .toEqual(false);
    });
});
