import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import BarclaycardPaymentMethod from './BarclaycardPaymentMethod';
import { createOffsitePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offsite';

describe('When using Barclaycard Payment Method', () => {
    let checkoutService: CheckoutService;
    let defaultProps: PaymentMethodProps;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let PaymentMethodTest: FunctionComponent;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: {
                id: 'barclaycard',
                method: 'barclaycard',
                supportedCards: [],
                config: {},
                type: 'card',
                gateway: '',
            },
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <BarclaycardPaymentMethod {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render Barclaycard PaymentMethod', () => {
        const view = render(<PaymentMethodTest />);

        expect(view).toMatchSnapshot();
    });

    it('should initialize Barclaycard PaymentMethod', () => {
        render(<PaymentMethodTest />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: '',
            methodId: 'barclaycard',
            integrations: [createOffsitePaymentStrategy],
        });
    });
});
