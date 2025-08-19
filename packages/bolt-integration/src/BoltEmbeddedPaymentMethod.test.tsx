import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';

describe('BoltEmbeddedPaymentMethod', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            checkoutService,
            checkoutState,
            language: createLanguageService(),
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
            paymentForm: getPaymentFormServiceMock(),
        };

        method = {
            ...getPaymentMethod(),
            id: 'bolt',
            method: 'bolt',
            initializationData: {
                embeddedOneClickEnabled: true,
            },
        };

        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <BoltEmbeddedPaymentMethod {...defaultProps} {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(container.getElementsByClassName('paymentMethod--hosted')).toHaveLength(1);
    });

    it('matches a snapshot', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} method={method} />);

        jest.spyOn(checkoutState.statuses, 'isInitializingPayment').mockReturnValue(false);

        expect(container).toMatchSnapshot();
    });
});
