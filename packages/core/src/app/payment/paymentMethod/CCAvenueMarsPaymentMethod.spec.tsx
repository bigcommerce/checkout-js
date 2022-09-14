import { mount } from 'enzyme';
import React from 'react';

import { getPaymentMethod } from '../payment-methods.mock';

import CCAvenueMarsPaymentMethod, {
    CCAvenueMarsPaymentMethodProps,
} from './CCAvenueMarsPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('When using CCAvenueMars Payment Method', () => {
    const defaultProps: CCAvenueMarsPaymentMethodProps = {
        method: {
            ...getPaymentMethod(),
            id: PaymentMethodId.CCAvenueMars,
            gateway: PaymentMethodId.CCAvenueMars,
        },
        deinitializePayment: jest.fn(),
        initializePayment: jest.fn(),
    };

    it('Shopper is able to see CCAvenueMars Payment Method', () => {
        const component = mount(<CCAvenueMarsPaymentMethod {...defaultProps} />);

        expect(component.find(HostedWidgetPaymentMethod)).toBeTruthy();
    });
});
