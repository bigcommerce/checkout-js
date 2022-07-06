import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedFieldPaymentMethod, { HostedFieldPaymentMethodProps } from './HostedFieldPaymentMethod';

describe('HostedFieldPaymentMethod', () => {
    let HostedFieldPaymentMethodTest: FunctionComponent<HostedFieldPaymentMethodProps>;
    let defaultProps: HostedFieldPaymentMethodProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'card-expiry',
            cardNumberId: 'card-number',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
        };

        localeContext = createLocaleContext(getStoreConfig());

        HostedFieldPaymentMethodTest = props => (
            <Formik
                initialValues={ {} }
                onSubmit={ noop }
            >
                <LocaleContext.Provider value={ localeContext }>
                    <HostedFieldPaymentMethod { ...props } />
                </LocaleContext.Provider>
            </Formik>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedFieldPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.initializePayment)
            .toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedFieldPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.deinitializePayment)
            .not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment)
            .toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<HostedFieldPaymentMethodTest
            { ...defaultProps }
            isInitializing
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(true);

        component = mount(<HostedFieldPaymentMethodTest { ...defaultProps } />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(false);
    });

    it('renders card number placeholder', () => {
        const component = mount(<HostedFieldPaymentMethodTest { ...defaultProps } />);

        expect(component.exists(`#${defaultProps.cardNumberId}`))
            .toEqual(true);
    });

    it('renders card expiry placeholder', () => {
        const component = mount(<HostedFieldPaymentMethodTest { ...defaultProps } />);

        expect(component.exists(`#${defaultProps.cardExpiryId}`))
            .toEqual(true);
    });

    it('renders card cvv placeholder if configured', () => {
        const component = mount(<HostedFieldPaymentMethodTest
            { ...defaultProps }
            cardCodeId="card-code"
        />);

        expect(component.exists('#card-code'))
            .toEqual(true);
    });

    it('renders postal code placeholder if configured', () => {
        const component = mount(<HostedFieldPaymentMethodTest
            { ...defaultProps }
            postalCodeId="postal-code"
        />);

        expect(component.exists('#postal-code'))
            .toEqual(true);
    });

    it('renders wallet button placeholder if required', () => {
        const component = mount(<HostedFieldPaymentMethodTest
            { ...defaultProps }
            walletButtons={ <div id="wallet-button" /> }
        />);

        expect(component.exists('#wallet-button'))
            .toEqual(true);
    });
});
