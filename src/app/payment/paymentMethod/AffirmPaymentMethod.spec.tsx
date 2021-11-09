import { mount } from 'enzyme';
import React from 'react';

import AffirmPaymentMethod, { AffirmPaymentMethodProps } from './AffirmPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';

describe('When using Affirm Payment Method', () => {
    const defaultProps: AffirmPaymentMethodProps = {
        method: {
            id: 'affirm',
            method: 'barclaycard',
            supportedCards: [],
            config: {},
            type: 'card',
            gateway: 'affirm',
        },
        deinitializePayment: jest.fn(),
        initializePayment: jest.fn(),
    };

    it('Shopper is able to see Affirm Payment Method', () => {
        const component = mount(<AffirmPaymentMethod { ...defaultProps } />);
        expect(component.find(HostedWidgetPaymentMethod)).toBeTruthy();
    });
});
