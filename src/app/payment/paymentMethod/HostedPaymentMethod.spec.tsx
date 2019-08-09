import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

describe('HostedPaymentMethod', () => {
    let defaultProps: HostedPaymentMethodProps;
    let HostedPaymentMethodTest: FunctionComponent<HostedPaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        HostedPaymentMethodTest = props => (
            <Formik
                initialValues={ {} }
                onSubmit={ noop }
            >
                <HostedPaymentMethod { ...props } />
            </Formik>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.initializePayment)
            .toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.deinitializePayment)
            .not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment)
            .toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize if description is provided', () => {
        let component: ReactWrapper;

        component = mount(<HostedPaymentMethodTest
            { ...defaultProps }
            description="Hello world"
            isInitializing
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(true);

        component = mount(<HostedPaymentMethodTest
            { ...defaultProps }
            description="Hello world"
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(false);
    });

    it('does not render loading overlay if there is no description', () => {
        let component: ReactWrapper;

        component = mount(<HostedPaymentMethodTest
            { ...defaultProps }
            isInitializing
        />);

        expect(component.find(LoadingOverlay))
            .toHaveLength(0);
    });
});
