import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getPaymentMethod } from '../payment-methods.mock';

import OfflinePaymentMethod, { OfflinePaymentMethodProps } from './OfflinePaymentMethod';

describe('OfflinePaymentMethod', () => {
    let defaultProps: OfflinePaymentMethodProps;
    let OfflinePaymentMethodTest: FunctionComponent<OfflinePaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        OfflinePaymentMethodTest = (props) => <OfflinePaymentMethod {...props} />;
    });

    it('initializes payment method when component mounts', () => {
        mount(<OfflinePaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<OfflinePaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });
});
