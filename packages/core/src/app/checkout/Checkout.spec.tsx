import { createCheckoutService, createEmbeddedCheckoutMessenger, CheckoutSelectors, CheckoutService, EmbeddedCheckoutMessenger, StepTracker } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import { noop, omit } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { BillingProps } from '../billing';
import Billing from '../billing/Billing';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { createErrorLogger, CustomError, ErrorModal } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { CustomerInfo, CustomerInfoProps, CustomerProps, CustomerViewType } from '../customer';
import { getCustomer } from '../customer/customers.mock';
import Customer from '../customer/Customer';
import { createEmbeddedCheckoutStylesheet, createEmbeddedCheckoutSupport } from '../embeddedCheckout';
import { getLanguageService, LocaleProvider } from '../locale';
import { PaymentProps } from '../payment';
import Payment from '../payment/Payment';
import { PromotionBannerList } from '../promotion';
import { ShippingProps, StaticConsignment } from '../shipping';
import { getConsignment } from '../shipping/consignment.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';
import Shipping from '../shipping/Shipping';

import { getCheckout, getCheckoutWithPromotions } from './checkouts.mock';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';
import Checkout, { CheckoutProps, WithCheckoutProps } from './Checkout';
import CheckoutProvider from './CheckoutProvider';
import CheckoutStep, { CheckoutStepProps } from './CheckoutStep';
import CheckoutStepType from './CheckoutStepType';

describe('Checkout', () => {
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: CheckoutProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let stepTracker: StepTracker;
    let subscribeEventEmitter: EventEmitter;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({ parentOrigin: getStoreConfig().links.siteLink });
        stepTracker = {
            trackCheckoutStarted: jest.fn(),
            trackStepViewed: jest.fn(),
            trackStepCompleted: jest.fn(),
        } as unknown as StepTracker;
        subscribeEventEmitter = new EventEmitter();

        defaultProps = {
            checkoutId: getCheckout().id,
            containerId: 'app',
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            embeddedSupport: createEmbeddedCheckoutSupport(getLanguageService()),
            errorLogger: createErrorLogger(),
            createStepTracker: () => stepTracker,
        };

        jest.spyOn(checkoutService, 'loadCheckout')
            .mockImplementation(() => new Promise(resolve => {
                jest.spyOn(checkoutState.data, 'getConfig')
                    .mockReturnValue({
                        ...getStoreConfig(),
                        checkoutSettings: {
                            ...getStoreConfig().checkoutSettings,
                            hasMultiShippingEnabled: true,
                        },
                    });

                resolve(checkoutState);
            }));

        jest.spyOn(checkoutService, 'getState')
            .mockImplementation(() => checkoutState);

        jest.spyOn(checkoutService, 'subscribe')
            .mockImplementation(subscriber => {
                subscribeEventEmitter.on('change', () => subscriber(checkoutService.getState()));
                subscribeEventEmitter.emit('change');

                return noop;
            });

        jest.spyOn(defaultProps.errorLogger, 'log')
            .mockImplementation(noop);

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        CheckoutTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleProvider checkoutService={ checkoutService }>
                    <Checkout { ...props } />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('loads checkout when mounted', () => {
        mount(<CheckoutTest { ...defaultProps } />);

        expect(checkoutService.loadCheckout)
            .toHaveBeenCalledWith(defaultProps.checkoutId, {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ],
                },
            });
    });

    it('tracks checkout started when config is ready', async () => {
        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(undefined);

        const component = mount(<CheckoutTest { ...defaultProps } />);

        component.setProps({ hasConfig: true });
        component.update();

        await new Promise(resolve => process.nextTick(resolve));

        expect(stepTracker.trackCheckoutStarted)
            .toHaveBeenCalled();
    });

    it('posts message to parent of embedded checkout when checkout is loaded', async () => {
        jest.spyOn(embeddedMessengerMock, 'postFrameLoaded')
            .mockImplementation();

        mount(<CheckoutTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(embeddedMessengerMock.postFrameLoaded)
            .toHaveBeenCalledWith({ contentId: defaultProps.containerId });
    });

    it('attaches additional styles for embedded checkout', async () => {
        const styles = { text: { color: '#000' } };

        jest.spyOn(embeddedMessengerMock, 'receiveStyles')
            .mockImplementation(fn => fn(styles));

        jest.spyOn(defaultProps.embeddedStylesheet, 'append')
            .mockImplementation();

        mount(<CheckoutTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.embeddedStylesheet.append)
            .toHaveBeenCalledWith(styles);
    });

    it('renders modal error when theres an error flash message', async () => {
        jest.spyOn(checkoutState.data, 'getFlashMessages')
            .mockReturnValue([
                {
                    message: 'flash message',
                    title: '',
                    type: 'error',
                },
            ]);

        const container = mount(<CheckoutTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(ErrorModal).prop('error'))
            .toEqual(new Error('flash message'));
    });

    it('renders modal error when theres an custom error flash message', async () => {
        jest.spyOn(checkoutState.data, 'getFlashMessages')
            .mockReturnValue([
                {
                    message: 'flash message',
                    title: 'flash title',
                    type: 'error',
                },
            ]);

        const container = mount(<CheckoutTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const errorData = {data: {}, message: 'flash message', title: 'flash title', name: 'default'};
        expect(container.find(ErrorModal).prop('error'))
            .toEqual(new CustomError(errorData));
    });

    it('renders required checkout steps', () => {
        const container = mount(<CheckoutTest { ...defaultProps } />);
        const steps = container.find(CheckoutStep);

        expect(steps.at(0).prop('type'))
            .toEqual(CheckoutStepType.Customer);

        expect(steps.at(1).prop('type'))
            .toEqual(CheckoutStepType.Shipping);

        expect(steps.at(2).prop('type'))
            .toEqual(CheckoutStepType.Billing);

        expect(steps.at(3).prop('type'))
            .toEqual(CheckoutStepType.Payment);
    });

    it('does not render checkout step if not required', () => {
        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue({
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [],
                },
            });

        const container = mount(<CheckoutTest { ...defaultProps } />);
        const steps = container.find(CheckoutStep);

        // When there's no physical item, shipping step shouldn't be rendered
        expect(steps.findWhere(step => step.prop('type') === CheckoutStepType.Shipping))
            .toHaveLength(0);
    });

    it('marks first incomplete step as active by default', async () => {
        const container = mount(<CheckoutTest { ...defaultProps } />);

        // Wait for initial load to complete
        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const steps = container.find(CheckoutStep);
        // tslint:disable-next-line:no-non-null-assertion
        const activeStepType = getCheckoutStepStatuses(checkoutState)
            .find(({ isActive }) => isActive === true)!.type;

        expect(steps.findWhere(step => step.prop('type') === activeStepType).at(0).prop('isActive'))
            .toEqual(true);
    });

    it('calls trackStepViewed when a step is expanded', async () => {
        jest.useFakeTimers();
        // JSDOM does not support `scrollTo`
        window.scrollTo = jest.fn();

        const container = mount(<CheckoutTest { ...defaultProps } />);

        const step = container.find(CheckoutStep)
            .findWhere(component => component.prop('type') === CheckoutStepType.Shipping)
            .at(0);

        step.prop('onEdit')(CheckoutStepType.Shipping);

        await new Promise(resolve => process.nextTick(resolve));

        jest.runAllTimers();

        expect(stepTracker.trackStepViewed)
            .toHaveBeenCalledWith('shipping');
    });

    it('marks step as active when user tries to edit it', () => {
        const container = mount(<CheckoutTest { ...defaultProps } />);

        let step = container.find(CheckoutStep)
            .findWhere(component => component.prop('type') === CheckoutStepType.Shipping)
            .at(0);

        expect(step.prop('isActive'))
            .toEqual(false);

        // Trigger edit event on step
        step.prop('onEdit')(CheckoutStepType.Shipping);

        step = container.update()
            .find(CheckoutStep)
            .findWhere(component => component.prop('type') === CheckoutStepType.Shipping)
            .at(0);

        expect(step.prop('isActive'))
            .toEqual(true);
    });

    it('renders list of promotion banners', () => {
        const checkout = getCheckoutWithPromotions();

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(checkout);

        const container = mount(<CheckoutTest { ...defaultProps } />);

        expect(container.find(PromotionBannerList))
            .toHaveLength(1);

        expect(container.find(PromotionBannerList).prop('promotions'))
            .toEqual(checkout.promotions);
    });

    describe('customer step', () => {
        let container: ReactWrapper<CheckoutProps & WithCheckoutProps>;

        beforeEach(async () => {
            container = mount(<CheckoutTest { ...defaultProps } />);

            (container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .findWhere(step => step.prop('type') === CheckoutStepType.Customer)
                .at(0)
                .prop('onEdit')(CheckoutStepType.Customer);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));
            container.update();
        });

        it('renders customer component when customer step is active', () => {
            expect(container.find(Customer).length)
                .toEqual(1);
        });

        it('calls trackStepComplete when switching steps', () => {
            container.setProps({
                steps: getCheckoutStepStatuses(checkoutState)
                    .map(step => ({
                        ...step,
                        isActive: step.type === CheckoutStepType.Shipping ? true : false,
                    })),
            });

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onSignIn')!();

            container.update();

            expect(stepTracker.trackStepCompleted)
                .toHaveBeenCalledWith('customer');
        });

        it('navigates to next step when shopper signs in', () => {
            container.setProps({
                steps: getCheckoutStepStatuses(checkoutState)
                    .map(step => ({
                        ...step,
                        isActive: step.type === CheckoutStepType.Shipping ? true : false,
                    })),
            });

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onSignIn')!();

            container.update();

            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);

            expect(steps.findWhere(step => step.prop('type') === CheckoutStepType.Shipping).at(0).prop('isActive'))
                .toEqual(true);
        });

        it('navigates to next step when account is created', () => {
            container.setProps({
                steps: getCheckoutStepStatuses(checkoutState)
                    .map(step => ({
                        ...step,
                        isActive: step.type === CheckoutStepType.Shipping ? true : false,
                    })),
            });

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onAccountCreated')!();

            container.update();

            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);

            expect(steps.findWhere(step => step.prop('type') === CheckoutStepType.Shipping).at(0).prop('isActive'))
                .toEqual(true);
        });

        it('navigates to next step when shopper continues as guest', () => {
            container.setProps({
                steps: getCheckoutStepStatuses(checkoutState)
                    .map(step => ({
                        ...step,
                        isActive: step.type === CheckoutStepType.Shipping ? true : false,
                    })),
            });

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onContinueAsGuest')!();

            container.update();

            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);

            expect(steps.findWhere(step => step.prop('type') === CheckoutStepType.Shipping).at(0).prop('isActive'))
                .toEqual(true);
        });

        it('renders guest form after sign out', () => {
            checkoutState = { ...checkoutState };

            jest.spyOn(checkoutState.data, 'getCustomer')
                .mockReturnValue(getCustomer());

            container = mount(<CheckoutTest { ...defaultProps } />);

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(CustomerInfo) as ReactWrapper<CustomerInfoProps>)
                .prop('onSignOut')!({ isCartEmpty: false });

            jest.spyOn(checkoutState.data, 'getCustomer')
                .mockReturnValue(undefined);

            container.update();

            expect(container.find(Customer).prop('viewType'))
                .toEqual(CustomerViewType.Guest);
        });

        it('navigates to login page if cart is empty after sign out', () => {
            checkoutState = { ...checkoutState };

            jest.spyOn(window.top.location, 'assign')
                .mockImplementation(noop);

            jest.spyOn(checkoutState.data, 'getCustomer')
                .mockReturnValue(getCustomer());

            container = mount(<CheckoutTest { ...defaultProps } />);

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(CustomerInfo) as ReactWrapper<CustomerInfoProps>)
                .prop('onSignOut')!({ isCartEmpty: true });

            expect(window.top.location.assign)
                .toHaveBeenCalled();
        });

        it('logs unhandled error', () => {
            const error = new Error();

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onUnhandledError')!(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });

        it('logs error if shopper is unable to sign in', () => {
            const error = new Error();

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onSignInError')!(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });

        it('logs error if shopper is unable to continue as guest', () => {
            const error = new Error();

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Customer).at(0) as ReactWrapper<CustomerProps>)
                .prop('onContinueAsGuestError')!(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });
    });

    describe('shipping step', () => {
        let container: ReactWrapper<CheckoutProps>;

        beforeEach(async () => {
            container = mount(<CheckoutTest { ...defaultProps } />);

            (container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .findWhere(step => step.prop('type') === CheckoutStepType.Shipping)
                .at(0)
                .prop('onEdit')(CheckoutStepType.Shipping);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));
            container.update();
        });

        it('renders shipping component when shipping step is active', () => {
            expect(container.find(Shipping).length)
                .toEqual(1);
        });

        it('renders multi-shipping when enabled and there are multiple consignments', async () => {
            jest.spyOn(checkoutState.data, 'getConsignments')
                .mockReturnValue([
                    omit(getConsignment(), 'selectedShippingOption'),
                    omit(getConsignment(), 'selectedShippingOption'),
                ]);

            container = mount(<CheckoutTest { ...defaultProps } />);

            (container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .findWhere(step => step.prop('type') === CheckoutStepType.Shipping)
                .at(0)
                .prop('onEdit')(CheckoutStepType.Shipping);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));
            container.update();

            expect(container.find(Shipping).at(0).prop('isMultiShippingMode'))
                .toEqual(true);
        });

        it('does not render multi-shipping when disabled even if there are multiple consignments', async () => {
            jest.spyOn(checkoutState.data, 'getConsignments')
                .mockReturnValue([
                    omit(getConsignment(), 'selectedShippingOption'),
                    omit(getConsignment(), 'selectedShippingOption'),
                ]);

            jest.spyOn(checkoutService, 'loadCheckout')
                .mockImplementation(() => new Promise(resolve => {
                    jest.spyOn(checkoutState.data, 'getConfig')
                        .mockReturnValue({
                            ...getStoreConfig(),
                            checkoutSettings: {
                                ...getStoreConfig().checkoutSettings,
                                hasMultiShippingEnabled: false,
                            },
                        });

                    resolve(checkoutState);
                }));

            container = mount(<CheckoutTest { ...defaultProps } />);

            (container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .findWhere(step => step.prop('type') === CheckoutStepType.Shipping)
                .at(0)
                .prop('onEdit')(CheckoutStepType.Shipping);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));
            container.update();

            expect(container.find(Shipping).at(0).prop('isMultiShippingMode'))
                .toEqual(false);
        });

        it('navigates to login view when shopper tries to sign in in order to use multi-shipping feature', () => {
            const shipping: ReactWrapper<ShippingProps> = container.find(Shipping).at(0);

            shipping.prop('onSignIn')();
            container.update();

            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);
            const customerStep: ReactWrapper<CheckoutStepProps> = steps.findWhere(step => step.prop('type') === CheckoutStepType.Customer).at(0);
            const customer: ReactWrapper<CustomerProps> = container.find(Customer).at(0);

            expect(customerStep.prop('isActive'))
                .toEqual(true);

            expect(customer.prop('viewType'))
                .toEqual(CustomerViewType.Login);
        });

        it('navigates to billing step if not using shipping address as billing address', () => {
            const shipping: ReactWrapper<ShippingProps> = container.find(Shipping).at(0);

            shipping.prop('navigateNextStep')(false);
            container.update();

            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);
            const nextStep: ReactWrapper<CheckoutStepProps> = steps.findWhere(step => step.prop('type') === CheckoutStepType.Billing).at(0);

            expect(nextStep.prop('isActive'))
                .toEqual(true);
        });

        it('navigates to next incomplete step if using shipping address as billing address', () => {
            const shipping: ReactWrapper<ShippingProps> = container.find(Shipping).at(0);

            shipping.prop('navigateNextStep')(true);
            container.update();

            // tslint:disable-next-line:no-non-null-assertion
            const activeStepType = getCheckoutStepStatuses(checkoutState)
                .find(({ isActive }) => isActive === true)!.type;
            const steps: ReactWrapper<CheckoutStepProps> = container.find(CheckoutStep);
            const nextStep: ReactWrapper<CheckoutStepProps> = steps.findWhere(step => step.prop('type') === activeStepType).at(0);

            expect(nextStep.prop('isActive'))
                .toEqual(true);
        });

        it('logs unhandled error', () => {
            const error = new Error();

            (container.find(Shipping).at(0) as ReactWrapper<ShippingProps>)
                .prop('onUnhandledError')(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });
    });

    describe('billing step', () => {
        let container: ReactWrapper<CheckoutProps>;
        const consignment = {
            ...getConsignment(),
            lineItemIds: [`${getPhysicalItem().id}`],
        };

        beforeEach(async () => {
            jest.spyOn(checkoutState.data, 'getConsignments')
                .mockReturnValue([consignment]);

            jest.spyOn(checkoutState.data, 'getShippingAddress')
                .mockReturnValue(getShippingAddress());

            jest.spyOn(checkoutState.data, 'getCustomer')
                .mockReturnValue(getCustomer());

            container = mount(<CheckoutTest { ...defaultProps } />);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));
            container.update();
        });

        it('renders shipping component with summary data', () => {
            expect((container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .at(1)
                .find(StaticConsignment)
                .props()
            )
                .toMatchObject({
                    cart: getCart(),
                    compactView: true,
                    consignment,
                });
        });

        it('renders billing component when billing step is active', () => {
            expect(container.find(Billing).length)
                .toEqual(1);
        });

        it('logs unhandled error', () => {
            const error = new Error();

            (container.find(Billing).at(0) as ReactWrapper<BillingProps>)
                .prop('onUnhandledError')(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });
    });

    describe('payment step', () => {
        let container: ReactWrapper<CheckoutProps & WithCheckoutProps>;

        beforeEach(async () => {
            jest.spyOn(location, 'replace')
                .mockImplementation(noop);

            container = mount(<CheckoutTest { ...defaultProps } />);

            (container.find(CheckoutStep) as ReactWrapper<CheckoutStepProps>)
                .findWhere(step => step.prop('type') === CheckoutStepType.Payment)
                .at(0)
                .prop('onEdit')(CheckoutStepType.Payment);

            // Wait for initial load to complete
            await new Promise(resolve => process.nextTick(resolve));

            act(() => { container.update(); });
            act(() => { container.update(); });
        });

        afterEach(() => {
            (location.replace as jest.Mock).mockReset();
        });

        it('renders payment component when payment step is active', () => {
            expect(container.find(Payment).length)
                .toEqual(1);
        });

        it('navigates to order confirmation page when payment is submitted', () => {
            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onSubmit')!();

            expect(location.replace)
                .toHaveBeenCalledWith('/order-confirmation');
        });

        it('navigates to order confirmation page when order is finalized', () => {
            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onFinalize')!();

            expect(location.replace)
                .toHaveBeenCalledWith('/order-confirmation');
        });

        it('posts message to parent of embedded checkout when shopper completes checkout', () => {
            jest.spyOn(embeddedMessengerMock, 'postComplete')
                .mockImplementation(noop);

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onSubmit')!();

            expect(embeddedMessengerMock.postComplete)
                .toHaveBeenCalled();
        });

        it('posts message to parent of embedded checkout when there is unhandled error', () => {
            jest.spyOn(embeddedMessengerMock, 'postError')
                .mockImplementation(noop);

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onUnhandledError')!(new Error());

            expect(embeddedMessengerMock.postError)
                .toHaveBeenCalled();
        });

        it('logs unhandled error', () => {
            const error = new Error();

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onUnhandledError')!(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });

        it('posts message to parent of embedded checkout when there is order submission error', () => {
            const error = new Error();

            jest.spyOn(embeddedMessengerMock, 'postError')
                .mockImplementation(noop);

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onSubmitError')!(error);

            expect(embeddedMessengerMock.postError)
                .toHaveBeenCalledWith(error);
        });

        it('logs error if unable to submit order', () => {
            const error = new Error();

            // tslint:disable-next-line:no-non-null-assertion
            (container.find(Payment).at(0) as ReactWrapper<PaymentProps>)
                .prop('onSubmitError')!(error);

            expect(defaultProps.errorLogger.log)
                .toHaveBeenCalledWith(error);
        });
    });
});
