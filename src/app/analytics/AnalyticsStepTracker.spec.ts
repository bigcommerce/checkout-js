import { createCheckoutService, CheckoutService, Order, ShopperCurrency } from '@bigcommerce/checkout-sdk';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getOrder } from '../order/orders.mock';
import { getPaymentMethod } from '../payment/payment-methods.mock';
import { getShippingOption } from '../shipping/shippingOption/shippingMethod.mock';

import AnalyticsStepTracker, { ANALYTIC_STEP_TYPE } from './AnalyticsStepTracker';

describe('AnalyticsStepTracker', () => {
    let checkoutService: CheckoutService;
    let analyticsStepTracker: AnalyticsStepTracker;
    let sessionStorage: any;
    let legacyStorage: any;
    let analytics: any;

    const VIEWED_EVENT_NAME = 'Checkout Step Viewed';
    const COMPLETED_EVENT_NAME = 'Checkout Step Completed';
    const storedData = {
        103: {
            brand: 'OFS',
            category: 'Cat 1',
        },
        104: {
            brand: 'Digitalia',
            category: 'Ebooks, Audio Books',
        },
    };

    beforeEach(() => {
        analytics = { track: jest.fn() };
        sessionStorage = {
            getItem: jest.fn(() => JSON.stringify(storedData)),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        };

        legacyStorage = {
            getItem: jest.fn(() => null),
        };

        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutService.getState().data, 'getConfig')
            .mockReturnValue({
                ...getStoreConfig(),
                shopperCurrency: {
                    code: 'JPY',
                    exchangeRate: 1.01,
                } as ShopperCurrency,
            });

        analyticsStepTracker = new AnalyticsStepTracker(
            checkoutService,
            sessionStorage,
            legacyStorage,
            analytics
        );
    });

    describe('#trackCheckoutStarted()', () => {
        beforeEach(() => {
            analyticsStepTracker.trackCheckoutStarted();
        });

        it('saves the category and brand data to the storage', () => {
            expect(sessionStorage.setItem)
                .toHaveBeenCalledWith(
                    'ORDER_ITEMS_b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    JSON.stringify(storedData)
                );
        });

        it('only tracks analytics once', () => {
            analyticsStepTracker.trackCheckoutStarted();
            analyticsStepTracker.trackCheckoutStarted();

            expect(analytics.track).toBeCalledTimes(1);
        });

        it('tracks the affiliation', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    affiliation: 's1504098821',
                })
            );
        });

        it('tracks the currency', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    currency: 'JPY',
                })
            );
        });

        it('tracks the expected tax', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    tax: 3.03,
                })
            );
        });

        it('tracks the expected revenue', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    revenue: 191.9,
                })
            );
        });

        it('tracks the expected shipping cost', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    shipping: 15.15,
                })
            );
        });

        it('tracks the coupons', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    coupon: 'savebig2015',
                })
            );
        });

        it('tracks the products', () => {
            expect(analytics.track).toHaveBeenCalledWith(
                'Checkout Started',
                expect.objectContaining({
                    products: [{
                        product_id: 103,
                        sku: 'CLC',
                        name: 'Canvas Laundry Cart',
                        price: 200,
                        quantity: 1,
                        image_url: '/images/canvas-laundry-cart.jpg',
                        brand: 'OFS',
                        category: 'Cat 1',
                        variant: 'n:v',
                    }, {
                        product_id: 104,
                        sku: 'CLX',
                        name: 'Digital Book',
                        price: 100,
                        quantity: 1,
                        image_url: '/images/digital-book.jpg',
                        brand: 'Digitalia',
                        category: 'Ebooks, Audio Books',
                        variant: 'm:l',
                    }],
                })
            );
        });
    });

    describe('#trackOrderComplete()', () => {
        describe('when order is not complete', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getOrder').mockReturnValue({
                    isComplete: false,
                } as Order);
                analyticsStepTracker.trackOrderComplete();
            });

            it('does not send any data', () => {
                expect(analytics.track).not.toHaveBeenCalled();
            });

            it('doest not remove the category and brand data from the storage', () => {
                expect(sessionStorage.removeItem).not.toHaveBeenCalled();
            });
        });

        describe('when there are no saved items', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getOrder')
                    .mockReturnValue(getOrder());

                sessionStorage.getItem = jest.fn(() => null);
                analyticsStepTracker.trackOrderComplete();
            });

            it('does not send any data', () => {
                expect(analytics.track).not.toHaveBeenCalled();
            });
        });

        describe('when there is a complete order', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getOrder')
                    .mockReturnValue(getOrder());

                analyticsStepTracker.trackOrderComplete();
            });

            it('tracks the order id', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        orderId: 295,
                    })
                );
            });

            it('tracks the order affiliation', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        affiliation: 's1504098821',
                    })
                );
            });

            it('tracks the order grand total', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        revenue: 191.9,
                    })
                );
            });

            it('tracks the order shipping cost', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        shipping: 15.15,
                    })
                );
            });

            it('tracks the order discount amount', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        discount: 10.1,
                    })
                );
            });

            it('tracks the order coupons as a single, comma-separated string', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        coupon: 'savebig2015,279F507D817E3E7',
                    })
                );
            });

            it('tracks the order currency', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        currency: 'JPY',
                    })
                );
            });

            it('tracks the tax total value', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        tax: 3.03,
                    })
                );
            });

            it('tracks the product list', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    'Order Completed',
                    expect.objectContaining({
                        products: [{
                            product_id: 103,
                            sku: 'CLC',
                            name: 'Canvas Laundry Cart',
                            price: 200,
                            quantity: 1,
                            image_url: '/images/canvas-laundry-cart.jpg',
                            brand: 'OFS',
                            category: 'Cat 1',
                            variant: 'n:v',
                        }, {
                            product_id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
                            name: '$100 Gift Certificate',
                            price: 101,
                            quantity: 1,
                        }],
                    })
                );
            });

            it('reads data from session storage', () => {
                expect(sessionStorage.getItem)
                    .toHaveBeenCalledWith('ORDER_ITEMS_b20deef40f9699e48671bbc3fef6ca44dc80e3c7');
            });

            it('removes the category and brand data to the storage', () => {
                expect(sessionStorage.removeItem)
                    .toHaveBeenCalledWith('ORDER_ITEMS_b20deef40f9699e48671bbc3fef6ca44dc80e3c7');
            });
        });
    });

    describe('#trackStepViewed()', () => {
        beforeEach(() => {
            analyticsStepTracker.trackStepViewed('payment.something');
        });

        it('sends step viewed tracking data to GA for the given step with current currency', () => {
            expect(analytics.track).toHaveBeenCalledWith(VIEWED_EVENT_NAME, { step: ANALYTIC_STEP_TYPE.PAYMENT, currency: 'JPY' });
        });

        it('sends step completed & viewed tracking data to GA for all the steps before given step (including current step)', () => {
            expect(analytics.track).toHaveBeenCalledWith(COMPLETED_EVENT_NAME, buildCompletedPayload(ANALYTIC_STEP_TYPE.CUSTOMER));
            expect(analytics.track).toHaveBeenCalledWith(COMPLETED_EVENT_NAME, buildCompletedPayload(ANALYTIC_STEP_TYPE.BILLING));
            expect(analytics.track).toHaveBeenCalledWith(COMPLETED_EVENT_NAME, buildCompletedPayload(ANALYTIC_STEP_TYPE.SHIPPING));

            expect(analytics.track).toHaveBeenCalledWith(VIEWED_EVENT_NAME, { step: ANALYTIC_STEP_TYPE.PAYMENT, currency: 'JPY' });
            expect(analytics.track).toHaveBeenCalledWith(VIEWED_EVENT_NAME, { step: ANALYTIC_STEP_TYPE.CUSTOMER, currency: 'JPY' });
            expect(analytics.track).toHaveBeenCalledWith(VIEWED_EVENT_NAME, { step: ANALYTIC_STEP_TYPE.BILLING, currency: 'JPY' });
            expect(analytics.track).toHaveBeenCalledWith(VIEWED_EVENT_NAME, { step: ANALYTIC_STEP_TYPE.SHIPPING, currency: 'JPY' });
        });
    });

    describe('#trackStepCompleted()', () => {
        describe('when no information is available', () => {
            beforeEach(() => {
                analyticsStepTracker.trackStepCompleted('payment.something');
            });

            it('sends an empty shippingMethod property when neither paymentMethod nor shippingMethod are specified', () => {
                expect(analytics.track).toHaveBeenCalledWith(COMPLETED_EVENT_NAME, buildCompletedPayload(ANALYTIC_STEP_TYPE.PAYMENT));
            });
        });

        describe('when there is information available', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getSelectedShippingOption')
                    .mockReturnValue(getShippingOption());

                jest.spyOn(checkoutService.getState().data, 'getSelectedPaymentMethod')
                    .mockReturnValue(getPaymentMethod());

                analyticsStepTracker.trackStepCompleted('payment.something');
            });

            it('sends the shippingMethod and payment data', () => {
                expect(analytics.track).toHaveBeenCalledWith(
                    COMPLETED_EVENT_NAME,
                    {
                        step: ANALYTIC_STEP_TYPE.PAYMENT,
                        shippingMethod: 'Flat Rate',
                        paymentMethod: 'Authorizenet',
                        currency: 'JPY',
                    }
                );
            });

            it('calls track only once per step', () => {
                analytics.track.mockReset();
                analyticsStepTracker.trackStepCompleted('payment.something');
                expect(analytics.track).toHaveBeenCalledTimes(0);
            });

            it('sends step complete event again if different shippingMethod method is selected', () => {
                jest.spyOn(checkoutService.getState().data, 'getSelectedShippingOption')
                        .mockReturnValue({
                            ...getShippingOption(),
                            id: 'id-foo',
                            description: 'foo',
                        });

                jest.spyOn(checkoutService.getState().data, 'getSelectedPaymentMethod')
                    .mockReturnValue(undefined);

                analyticsStepTracker.trackStepCompleted('shipping');

                expect(analytics.track).toHaveBeenLastCalledWith(
                    COMPLETED_EVENT_NAME,
                    {
                        step: ANALYTIC_STEP_TYPE.SHIPPING,
                        shippingMethod: 'foo',
                        currency: 'JPY',
                    }
                );
            });
        });
    });

    function buildCompletedPayload(step: ANALYTIC_STEP_TYPE) {
        return { step, shippingMethod: ' ', currency: 'JPY' };
    }
});
