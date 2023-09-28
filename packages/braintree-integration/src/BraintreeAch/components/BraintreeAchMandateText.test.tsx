import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import { AccountTypes, OwnershipTypes } from '../constants';

import BraintreeAchMandateText, { BraintreeAchMandateTextProps } from './BraintreeAchMandateText';

describe('BraintreeAchMandateText', () => {
    let BraintreeAchMandateTextTest: FunctionComponent<BraintreeAchMandateTextProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    const defaultProps = {
        updateMandateText: jest.fn().mockReturnValue('mandate text'),
        isInstrumentFeatureAvailable: false,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        global.Date.now = jest.fn(() => new Date('2023-01-01T10:00:00Z').getTime());

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        BraintreeAchMandateTextTest = (props: BraintreeAchMandateTextProps) => {
            return (
                <Formik initialValues={{}} onSubmit={noop}>
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <BraintreeAchMandateText {...props} />
                        </PaymentFormContext.Provider>
                    </CheckoutContext.Provider>
                </Formik>
            );
        };
    });

    it('renders mandate text checkbox with personal data label text', () => {
        const formValues = {
            paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '100000000',
            routingNumber: '010000015',
            businessName: '',
            firstName: 'Name',
            lastName: 'Surname',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
            orderConsent: false,
        };

        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(formValues);

        const view = render(<BraintreeAchMandateTextTest {...defaultProps} />);

        expect(view).toMatchSnapshot();
    });

    it('renders mandate text checkbox with business data label text', () => {
        const formValues = {
            paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
            ownershipType: OwnershipTypes.Business,
            accountType: AccountTypes.Savings,
            accountNumber: '100000000',
            routingNumber: '010000015',
            businessName: 'BigcommerceStore',
            firstName: '',
            lastName: '',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
            orderConsent: false,
        };

        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(formValues);

        const view = render(<BraintreeAchMandateTextTest {...defaultProps} />);

        expect(view).toMatchSnapshot();
    });

    it('renders mandate text checkbox with text for vaulting', () => {
        const formValues = {
            paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '100000000',
            routingNumber: '010000015',
            businessName: '',
            firstName: 'Name',
            lastName: 'Surname',
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
            orderConsent: false,
        };

        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(formValues);

        const view = render(
            <BraintreeAchMandateTextTest
                isInstrumentFeatureAvailable={false}
                updateMandateText={defaultProps.updateMandateText}
            />,
        );

        expect(view).toMatchSnapshot();
    });
});
