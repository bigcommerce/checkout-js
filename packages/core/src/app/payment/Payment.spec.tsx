import { createCheckoutService, CheckoutSelectors, CheckoutService, CustomError, PaymentMethod, RequestError } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import { find, merge, noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getCart } from '../cart/carts.mock';
import { CheckoutProvider } from '../checkout';
import { getCheckout, getCheckoutPayment } from '../checkout/checkouts.mock';
import { ErrorModal } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { getOrder } from '../order/orders.mock';
import { getConsignment } from '../shipping/consignment.mock';
import { Button } from '../ui/button';

import { getPaymentMethod } from './payment-methods.mock';
import { PaymentMethodId } from './paymentMethod';
import Payment, { PaymentProps } from './Payment';
import PaymentForm, { PaymentFormProps } from './PaymentForm';

describe('Payment', () => {
    let PaymentTest: FunctionComponent<PaymentProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentProps;
    let localeContext: LocaleContextType;
    let paymentMethods: PaymentMethod[];
    let selectedPaymentMethod: PaymentMethod;
    let subscribeEventEmitter: EventEmitter;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentMethods = [
            getPaymentMethod(),
            { ...getPaymentMethod(), id: 'sagepay' },
            { ...getPaymentMethod(), id: 'bolt', initializationData: { showInCheckout: true }},
        ];
        selectedPaymentMethod = paymentMethods[0];
        subscribeEventEmitter = new EventEmitter();

        jest.spyOn(checkoutService, 'getState')
            .mockImplementation(() => checkoutState);

        jest.spyOn(checkoutService, 'subscribe')
            .mockImplementation(subscriber => {
                subscribeEventEmitter.on('change', () => subscriber(checkoutService.getState()));
                subscribeEventEmitter.emit('change');

                return noop;
            });

        jest.spyOn(checkoutService, 'loadPaymentMethods')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'finalizeOrderIfNeeded')
            .mockRejectedValue({ type: 'order_finalization_not_required' });

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getOrder')
            .mockReturnValue(merge(getOrder(), { isComplete: false }));

        jest.spyOn(checkoutState.data, 'getPaymentMethods')
            .mockReturnValue(paymentMethods);

        jest.spyOn(checkoutState.data, 'getPaymentMethod')
            .mockImplementation(id => find(checkoutState.data.getPaymentMethods(), { id }));

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            onSubmit: jest.fn(),
            onSubmitError: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        PaymentTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <Payment { ...props } />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders payment form with expected props', async () => {
        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).props())
            .toEqual(expect.objectContaining({
                methods: paymentMethods,
                onSubmit: expect.any(Function),
                selectedMethod: paymentMethods[0],
            }));
    });

    it('does not render amazon if multi-shipping', async () => {
        paymentMethods.push({ ...getPaymentMethod(), id: 'amazonpay' });

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([
                getConsignment(),
                getConsignment(),
            ]);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        paymentMethods.pop();

        expect(container.find(PaymentForm).prop('methods'))
            .toEqual(paymentMethods);
    });

    it('does not render bolt if showInCheckout is false', async () => {
        const expectedPaymentMethods = paymentMethods.filter(method =>  method.id !== PaymentMethodId.Bolt);
        paymentMethods[2] = { ...getPaymentMethod(), id: 'bolt', initializationData: { showInCheckout: false } };

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).props())
            .toEqual(expect.objectContaining({
                methods: expectedPaymentMethods,
                onSubmit: expect.any(Function),
                selectedMethod: expectedPaymentMethods[0],
            }));
    });

    it('passes initialisation status to payment form', async () => {
        jest.spyOn(checkoutState.statuses, 'isInitializingPayment')
            .mockReturnValue(true);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).prop('isInitializingPayment'))
            .toEqual(true);
    });

    it('does not render payment form until initial requests are made', async () => {
        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(PaymentForm).length)
            .toEqual(0);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).length)
            .toEqual(1);
        expect(checkoutService.loadPaymentMethods)
            .toHaveBeenCalled();
        expect(checkoutService.finalizeOrderIfNeeded)
            .toHaveBeenCalled();
    });

    it('does not render payment form if there are no methods', () => {
        jest.spyOn(checkoutState.data, 'getPaymentMethods')
            .mockReturnValue([]);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(PaymentForm).length)
            .toEqual(0);
    });

    it('does not render payment form if the current order is complete', () => {
        jest.spyOn(checkoutState.data, 'getOrder')
            .mockReturnValue(getOrder());

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(PaymentForm).length)
            .toEqual(0);
    });

    it('loads payment methods when component is mounted', async () => {
        mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.loadPaymentMethods)
            .toHaveBeenCalled();
    });

    it('triggers callback when payment methods are loaded', async () => {
        const handeReady = jest.fn();

        mount(<PaymentTest { ...defaultProps } onReady={ handeReady } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(handeReady)
            .toHaveBeenCalled();
    });

    it('calls applyStoreCredit when checkbox is clicked', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({
                ...getCustomer(),
                storeCredit: 10,
            });

        jest.spyOn(checkoutService, 'applyStoreCredit')
            .mockResolvedValue(checkoutState);

        const component = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        component.find('input[name="useStoreCredit"]')
            .simulate('change', { target: { checked: false, name: 'useStoreCredit' } });

        expect(checkoutService.applyStoreCredit)
            .toHaveBeenCalledWith(false);
    });

    it('sets default selected payment method', async () => {
        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).prop('selectedMethod'))
            .toEqual(paymentMethods[0]);
    });

    it('sets default selected payment method to the one with default stored instrument', async () => {
        paymentMethods[1].config.hasDefaultStoredInstrument = true;

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).props())
            .toEqual(expect.objectContaining({
                methods: paymentMethods,
                selectedMethod: paymentMethods[1],
            }));
    });

    it('renders PaymentForm with usableStoreCredit=0 when grandTotal=0', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue({
                ...getCheckout(),
                grandTotal: 0,
            });

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).prop('usableStoreCredit'))
            .toEqual(0);
    });

    it('renders PaymentForm with grandTotal as usableStoreCredit when usableStoreCredit > grandTotal', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue({
                ...getCheckout(),
                grandTotal: 20,
            });

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({
                ...getCustomer(),
                storeCredit: 100,
            });

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).prop('usableStoreCredit'))
            .toEqual(20);
    });

    it('sets selected hosted payment as default selected payment method and filters methods prop to the hosted payment only', async () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue({
                ...getCheckout(),
                payments: [{
                    ...getCheckoutPayment(),
                    providerId: paymentMethods[1].id,
                }],
            });

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).props())
            .toEqual(expect.objectContaining({
                methods: [paymentMethods[1]],
                selectedMethod: paymentMethods[1],
            }));
    });

    it('updates default selected payment method when list changes', async () => {
        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        expect(container.find(PaymentForm).prop('selectedMethod'))
            .toEqual(paymentMethods[0]);

        // Update the list of payment methods so that its order is reversed
        checkoutState = merge({}, checkoutState, {
            data: {
                getPaymentMethods: jest.fn(() => ([paymentMethods[1], paymentMethods[0]])),
            },
        });

        subscribeEventEmitter.emit('change');
        container.update();

        expect(container.find(PaymentForm).prop('selectedMethod'))
            .toEqual(paymentMethods[1]);
    });

    it('tries to finalize order when component is mounted', async () => {
        mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.finalizeOrderIfNeeded)
            .toHaveBeenCalled();
    });

    it('triggers completion handler if order is finalized successfully', async () => {
        jest.spyOn(checkoutService, 'finalizeOrderIfNeeded')
            .mockResolvedValue(checkoutState);

        const handleFinalize = jest.fn();

        mount(<PaymentTest
            { ...defaultProps }
            onFinalize={ handleFinalize }
        />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleFinalize)
            .toHaveBeenCalled();
    });

    it('triggers error handler if unable to finalize', async () => {
        jest.spyOn(checkoutService, 'finalizeOrderIfNeeded')
            .mockRejectedValue({ type: 'unknown_error' });

        const handleFinalizeError = jest.fn();

        mount(<PaymentTest
            { ...defaultProps }
            onFinalizeError={ handleFinalizeError }
        />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleFinalizeError)
            .toHaveBeenCalled();
    });

    it('does not trigger error handler if finalization is not required', async () => {
        const handleFinalizeError = jest.fn();

        mount(<PaymentTest
            { ...defaultProps }
            onFinalizeError={ handleFinalizeError }
        />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleFinalizeError)
            .not.toHaveBeenCalled();
    });

    it('checks if available payment methods are supported in embedded mode', () => {
        const checkEmbeddedSupport = jest.fn();

        mount(<PaymentTest
            { ...defaultProps }
            checkEmbeddedSupport={ checkEmbeddedSupport }
        />);

        expect(checkEmbeddedSupport)
            .toHaveBeenCalledWith(paymentMethods.map(({ id }) => id));
    });

    it('renders error modal if there is error when submitting order', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'payment_method_invalid' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(1);
    });

    it('does not render error modal when there is cancellation error', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'payment_cancelled' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(0);
    });

    it('does not render error modal when there is spam protection not completed error', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'spam_protection_not_completed' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(0);
    });

    it('does not render error modal when there is invalid payment form error', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'payment_invalid_form' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(0);
    });

    it('does not render error modal when there is invalid hosted form value error', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'invalid_hosted_form_value' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(0);
    });

    it('renders error modal if there is error when finalizing order', () => {
        jest.spyOn(checkoutState.errors, 'getFinalizeOrderError')
            .mockReturnValue({ type: 'request' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(1);
    });

    it('redirects to location error header when error type is provider_error', () => {
        jest.spyOn(window.top.location, 'assign')
            .mockImplementation();

        jest.spyOn(checkoutState.errors, 'getFinalizeOrderError')
            .mockReturnValue({
                type: 'request',
                body: { type: 'provider_error' },
                headers: { location: 'foo' },
            } as unknown as RequestError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        container.find(Button).simulate('click');

        expect(window.top.location.assign).toHaveBeenCalledWith('foo');
    });

    it('does not render error modal if order does not need to finalize', () => {
        jest.spyOn(checkoutState.errors, 'getFinalizeOrderError')
            .mockReturnValue({ type: 'order_finalization_not_required' } as CustomError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        expect(container.find(ErrorModal))
            .toHaveLength(0);
    });

    it('passes validation schema to payment form', async () => {
        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const form: ReactWrapper<PaymentFormProps> = container.find(PaymentForm);

        try {
            // tslint:disable-next-line:no-non-null-assertion
            form.prop('validationSchema')!.validateSync({ ccNumber: '' });
        } catch (error) {
            expect(error.name)
                .toEqual('ValidationError');
        }
    });

    it('submits order with payment data if payment is required', async () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'isPaymentDataSubmitted')
            .mockReturnValue(false);

        jest.spyOn(checkoutService, 'submitOrder')
            .mockResolvedValue(checkoutState);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const form: ReactWrapper<PaymentFormProps> = container.find(PaymentForm);

        // tslint:disable-next-line:no-non-null-assertion
        form.prop('onSubmit')!({
            ccCvv: '123',
            ccExpiry: '10 / 25',
            ccName: 'test',
            ccNumber: '4111 1111 1111 1111',
            paymentProviderRadio: selectedPaymentMethod.id,
        });

        expect(checkoutService.submitOrder)
            .toHaveBeenCalledWith({
                payment: {
                    methodId: selectedPaymentMethod.id,
                    gatewayId: selectedPaymentMethod.gateway,
                    paymentData: {
                        ccCvv: '123',
                        ccExpiry: {
                            month: '10',
                            year: '2025',
                        },
                        ccName: 'test',
                        ccNumber: '4111111111111111',
                    },
                },
            });
    });

    it('triggers callback when order is submitted successfully', async () => {
        jest.spyOn(checkoutService, 'submitOrder')
            .mockResolvedValue(checkoutState);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const form: ReactWrapper<PaymentFormProps> = container.find(PaymentForm);

        // tslint:disable-next-line:no-non-null-assertion
        form.prop('onSubmit')!({
            ccCvv: '123',
            ccExpiry: '10 / 25',
            ccName: 'test',
            ccNumber: '4111 1111 1111 1111',
            paymentProviderRadio: selectedPaymentMethod.id,
        });

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onSubmit)
            .toHaveBeenCalled();
    });

    it('triggers error callback when order fails to submit', async () => {
        jest.spyOn(checkoutService, 'submitOrder')
            .mockRejectedValue(checkoutState);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const form: ReactWrapper<PaymentFormProps> = container.find(PaymentForm);

        // tslint:disable-next-line:no-non-null-assertion
        form.prop('onSubmit')!({
            ccCvv: '123',
            ccExpiry: '10 / 25',
            ccName: 'test',
            ccNumber: '4111 1111 1111 1111',
            paymentProviderRadio: selectedPaymentMethod.id,
        });

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onSubmitError)
            .toHaveBeenCalled();
    });

    it('submits order with selected instrument if payment is required', async () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'isPaymentDataSubmitted')
            .mockReturnValue(false);

        jest.spyOn(checkoutService, 'submitOrder')
            .mockResolvedValue(checkoutState);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));
        container.update();

        const form: ReactWrapper<PaymentFormProps> = container.find(PaymentForm);

        // tslint:disable-next-line:no-non-null-assertion
        form.prop('onSubmit')!({
            ccCvv: '123',
            ccNumber: '4111 1111 1111 1111',
            instrumentId: '123',
            paymentProviderRadio: selectedPaymentMethod.id,
        });

        expect(checkoutService.submitOrder)
            .toHaveBeenCalledWith({
                payment: {
                    methodId: selectedPaymentMethod.id,
                    gatewayId: selectedPaymentMethod.gateway,
                    paymentData: {
                        ccCvv: '123',
                        ccNumber: '4111111111111111',
                        instrumentId: '123',
                    },
                },
            });
    });

    it('reloads checkout object if unable to submit order due to spam protection error', async () => {
        jest.spyOn(checkoutService, 'loadCheckout')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({
                type: 'request',
                body: { type: 'spam_protection_expired' },
            } as unknown as RequestError);

        const container = mount(<PaymentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        container.update();
        container.find('ErrorModal Button').simulate('click');

        expect(checkoutService.loadCheckout)
            .toHaveBeenCalled();
        expect(container.find(PaymentForm).prop('didExceedSpamLimit'))
            .toBeTruthy();
    });
});
