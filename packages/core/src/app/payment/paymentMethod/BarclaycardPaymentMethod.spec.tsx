import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import BarclaycardPaymentMethod, { BarclaycardPaymentMethodProps } from './BarclaycardPaymentMethod';
import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

describe('when using Barclaycard payment', () => {
    const defaultProps: BarclaycardPaymentMethodProps = {
        method: {
            id: 'barclaycard',
            method: 'barclaycard',
            supportedCards: [],
            config: {},
            type: 'card',
            gateway: 'barclaycard',
        },
        deinitializePayment: jest.fn(),
        initializePayment: jest.fn(),
    };

    it('should mount Barclaycard', () => {
        const container = mount(<BarclaycardPaymentMethod { ...defaultProps } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

        expect(container.find(HostedWidgetPaymentMethod)).toBeTruthy();
        expect(component.prop('containerId')).toBe('barclaycard-container');
    });
});
