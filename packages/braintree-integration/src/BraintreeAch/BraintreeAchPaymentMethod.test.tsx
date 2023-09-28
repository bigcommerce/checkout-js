import {
    BillingAddress,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreeAchPaymentMethod,
    getCustomer,
    getGuestCustomer,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreeAchPaymentMethod from './BraintreeAchPaymentMethod';

jest.mock('./components/BraintreeAchPaymentForm', () => () => <div>Hello world</div>);

describe('BraintreeAchPaymentForm', () => {
    let BraintreeAchPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let defaultPropsWithVaulting: PaymentMethodProps;
    let paymentForm: PaymentFormService;

    // TODO: add getAddress mock to @bigcommerce/checkout/test-mocks package
    const billingAddress: BillingAddress = {
        id: '1',
        firstName: 'Test',
        lastName: 'Tester',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        const { language } = createLocaleContext(getStoreConfig());

        const methodWithoutVaultingFeature = getBraintreeAchPaymentMethod();
        const methodWithVaultingFeature = {
            ...methodWithoutVaultingFeature,
            config: {
                ...methodWithoutVaultingFeature.config,
                isVaultingEnabled: true,
            },
        };

        defaultProps = {
            method: methodWithoutVaultingFeature,
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        defaultPropsWithVaulting = {
            method: methodWithVaultingFeature,
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        BraintreeAchPaymentMethodTest = (props: PaymentMethodProps) => (
            <Formik initialValues={{}} onSubmit={noop}>
                <BraintreeAchPaymentMethod {...props} />
            </Formik>
        );
    });

    it('successfully initializes payment with required props', () => {
        render(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            braintreeach: {
                getMandateText: expect.any(Function),
            },
            gatewayId: undefined,
            methodId: 'braintreeach',
        });
    });

    it('catches an error during failed initialization of loadInstruments', async () => {
        jest.spyOn(checkoutService, 'loadInstruments').mockRejectedValue(new Error('error'));

        render(<BraintreeAchPaymentMethodTest {...defaultPropsWithVaulting} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultPropsWithVaulting.onUnhandledError).toHaveBeenCalled();
    });

    it('successfully deinitializes payment on component unmount', () => {
        const view = render(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        view.unmount();

        expect(checkoutService.initializePayment).toHaveBeenCalled();
        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            gatewayId: undefined,
            methodId: 'braintreeach',
        });
    });

    it('catches an error during failed initialization of deinitializePayment', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(new Error('error'));

        const view = render(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        view.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('loads instruments for signed in customer', () => {
        render(<BraintreeAchPaymentMethodTest {...defaultPropsWithVaulting} />);

        expect(checkoutService.loadInstruments).toHaveBeenCalled();
    });

    it('should not load instruments for guest customers', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        render(<BraintreeAchPaymentMethodTest {...defaultPropsWithVaulting} />);

        expect(checkoutService.loadInstruments).not.toHaveBeenCalled();
    });

    it('catches an error during failed initialization of initializePayment', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('error'));
        render(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
