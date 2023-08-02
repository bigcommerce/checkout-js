import { render } from '@testing-library/react';
import React from 'react';

import * as paymentIntegrationApi from '@bigcommerce/checkout/payment-integration-api';
import { getCart, getConsignment } from '@bigcommerce/checkout/test-utils';

import { PaymentMethodId } from '../payment/paymentMethod';

import ShippingSummary from './ShippingSummary';

jest.mock('./PayPalAxo', () => ({
    PayPalAxoStaticConsignment: () => <div>PayPalAxoStaticConsignment</div>
}));

jest.mock('./StaticConsignment', () => () => <div>StaticConsignment</div>);

describe('ShippingSummary', () => {
    const defaultProps = {
        consignment: getConsignment(),
        cart: getCart(),
        compactView: false,
    };

    const mockUseCheckout = (paymentMethodId?: PaymentMethodId) => {
        const getConfigMock = () => ({
            checkoutSettings: {
                providerWithCustomCheckout: paymentMethodId,
            }
        });

        jest.spyOn(paymentIntegrationApi, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    data: {
                        getConfig: getConfigMock,
                    },
                },
            }))
        );
    };

    it('renders StaticConsignment', () => {
        mockUseCheckout();
        
        const { getByText, queryByText } = render(<ShippingSummary {...defaultProps} />);
        
        expect(getByText('StaticConsignment')).toBeInTheDocument();
        expect(queryByText('PayPalAxoStaticConsignment')).not.toBeInTheDocument();
    });

    it('renders PayPalAxo StaticConsignment', () => {
        mockUseCheckout(PaymentMethodId.BraintreeAcceleratedCheckout);
        
        const { getByText, queryByText } = render(<ShippingSummary {...defaultProps} />);
        
        expect(queryByText('StaticConsignment')).not.toBeInTheDocument();
        expect(getByText('PayPalAxoStaticConsignment')).toBeInTheDocument();
    });
});

