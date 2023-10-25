import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { usePayPalConnectAddress } from '@bigcommerce/checkout/paypal-connect-integration';

import { StaticAddress } from '../address';
import { getAddress } from '../address/address.mock';
import { getAddressFormFields } from '../address/formField.mock';
import { getCheckout, getCheckoutPayment } from '../checkout/checkouts.mock';

import StaticBillingAddress, { StaticBillingAddressProps } from './StaticBillingAddress';

jest.mock('@bigcommerce/checkout/paypal-connect-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/paypal-connect-integration'),
    usePayPalConnectAddress: jest.fn(() => ({
        isPayPalAxoEnabled: false,
        paypalConnectAddresses: [],
    })),
    PoweredByPaypalConnectLabel: jest.fn(() => (
        <div data-test="powered-by-paypal-connect-label">PoweredByPaypalConnectLabel</div>
    )),
}));

describe('StaticBillingAddress', () => {
    let StaticBillingAddressTest: FunctionComponent<StaticBillingAddressProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: StaticBillingAddressProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            address: getAddress(),
        };

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        StaticBillingAddressTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <StaticBillingAddress {...props} />
                </CheckoutProvider>
            </LocaleProvider>
        );
    });

    it('renders address normally if not using Amazon', () => {
        const container = mount(<StaticBillingAddressTest {...defaultProps} />);

        expect(container.find(StaticAddress)).toHaveLength(1);
    });

    it('renders message instead of address when using Amazon Pay V2 and no full address is provided', () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            payments: [getCheckoutPayment()],
        });

        const addressData = {
            ...getAddress(),
        };

        const container = mount(<StaticBillingAddressTest address={addressData} />);

        expect(container.find(StaticAddress)).toHaveLength(0);

        expect(container.text()).toEqual(
            getLanguageService().translate('billing.billing_address_amazonpay'),
        );
    });

    describe('with PayPal Connect flow', () => {
        it('should not show label if PayPal Axo is disabled', () => {
            const container = mount(<StaticBillingAddressTest {...defaultProps} />);

            expect(container.find('[data-test="powered-by-paypal-connect-label"]')).toHaveLength(0);
        });

        it('should not show label if PayPal Axo is enabled but no PP addresses available', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalConnectAddress as jest.Mock).mockReturnValue({
                isPayPalAxoEnabled: true,
                paypalConnectAddresses: [],
            });

            const container = mount(<StaticBillingAddressTest {...defaultProps} />);

            expect(container.find('[data-test="powered-by-paypal-connect-label"]')).toHaveLength(0);
        });

        it('should show label if PayPal Axo is enabled and address match to PP address', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalConnectAddress as jest.Mock).mockReturnValue({
                isPayPalAxoEnabled: true,
                paypalConnectAddresses: [getAddress()],
                shouldShowPayPalConnectLabel: true,
            });

            const container = mount(<StaticBillingAddressTest {...defaultProps} />);

            expect(container.find('[data-test="powered-by-paypal-connect-label"]')).toHaveLength(1);
        });
    });
});
