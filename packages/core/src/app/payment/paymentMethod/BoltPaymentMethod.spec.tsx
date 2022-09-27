import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getPaymentMethod } from '../payment-methods.mock';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';
import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';
import BoltPaymentMethod from './BoltPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using Bolt payment', () => {
    let defaultProps: HostedPaymentMethodProps;
    let PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        defaultProps = {
            initializePayment: jest.fn(),
            deinitializePayment: jest.fn(),
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.Bolt,
                initializationData: {
                    embeddedOneClickEnabled: false,
                },
            },
        };

        PaymentMethodTest = (props) => <BoltPaymentMethod {...defaultProps} {...props} />;
    });

    it('renders as bolt client payment method if embeddedOneClickEnabled is false', () => {
        defaultProps.method.initializationData.embeddedOneClickEnabled = false;

        const container = mount(<PaymentMethodTest />);

        expect(container.find(BoltClientPaymentMethod)).toHaveLength(1);
        expect(container.find(HostedPaymentMethod)).toHaveLength(1);
    });

    it('renders as bolt embedded payment method if embeddedOneClickEnabled is true', () => {
        defaultProps.method.initializationData.embeddedOneClickEnabled = true;

        const container = mount(<PaymentMethodTest />);

        expect(container.find(BoltEmbeddedPaymentMethod)).toHaveLength(1);
        expect(container.find(HostedWidgetPaymentMethod)).toHaveLength(1);
    });
});
