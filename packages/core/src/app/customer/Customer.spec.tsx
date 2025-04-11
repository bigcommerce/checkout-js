import {
    BillingAddress,
    Cart,
    Checkout,
    CheckoutService,
    createCheckoutService,
    Customer as CustomerData,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { render } from '@bigcommerce/checkout/test-utils';
import React, { FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { getStoreConfig } from '../config/config.mock';
import { PaymentMethodId } from '../payment/paymentMethod';

import Customer, { CustomerProps, WithCheckoutCustomerProps } from './Customer';
import { getGuestCustomer } from './customers.mock';
import CustomerViewType from './CustomerViewType';

describe('Customer', () => {
    let CustomerTest: FunctionComponent<CustomerProps & Partial<WithCheckoutCustomerProps>>;
    let billingAddress: BillingAddress;
    let checkout: Checkout;
    let cart: Cart;
    let checkoutService: CheckoutService;
    let config: StoreConfig;
    let configStripeUpe: StoreConfig;
    let customer: CustomerData;
    let localeContext: LocaleContextType;
    const defaultProps = {
        isSubscribed: false,
        isWalletButtonsOnTop: false,
        onSubscribeToNewsletter: jest.fn(),
        step: {} as CheckoutStepStatus,
    };

    beforeEach(() => {
        billingAddress = getBillingAddress();
        checkout = getCheckout();
        cart = getCart();
        customer = getGuestCustomer();
        config = getStoreConfig();
        configStripeUpe = {
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            },
        };

        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
            billingAddress,
        );

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);

        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(cart);

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(customer);

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(config);

        jest.spyOn(checkoutService, 'loadPaymentMethods').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService, 'initializeCustomer').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([]);

        localeContext = createLocaleContext(getStoreConfig());

        CustomerTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AnalyticsProviderMock>
                        <Customer {...props} />
                    </AnalyticsProviderMock>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when view type is "guest"', () => {
        it('renders stripe guest form if enabled', async () => {
            const steps = {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer,
            };

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
                configStripeUpe,
            );

            const { container, findByTestId } = render(
                <CustomerTest {...defaultProps} step={steps} viewType={CustomerViewType.Guest} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(container.querySelector('#stripeupeLink')).toBeInTheDocument();
            expect(await findByTestId('stripe-customer-continue-as-guest-button')).toBeInTheDocument();
        });

        it("doesn't render Stripe guest form if it enabled but cart amount is smaller then Stripe requires", async () => {
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
                configStripeUpe,
            );
            jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                ...cart,
                cartAmount: 0.4,
            });

            const steps = {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer,
            };

            const { container, findByTestId } = render(
                <CustomerTest {...defaultProps} step={steps} viewType={CustomerViewType.Guest} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(container.querySelector('#stripeupeLink')).not.toBeInTheDocument();
            expect(await findByTestId('checkout-customer-guest')).toBeInTheDocument();
            expect(await findByTestId('customer-continue-as-guest-button')).toBeInTheDocument();
        });
    });
});
