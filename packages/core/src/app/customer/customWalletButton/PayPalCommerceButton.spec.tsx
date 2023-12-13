import { mount } from 'enzyme';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { navigateToOrderConfirmation } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import CheckoutButton from '../CheckoutButton';

import PayPalCommerceButton from './PayPalCommerceButton';

describe('PayPalCommerceButton', () => {
    let localeContext: LocaleContextType;
    let ButtonTest: FunctionComponent;
    const initialize = jest.fn();
    const error = jest.fn();

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        ButtonTest = () => (
            <LocaleContext.Provider value={localeContext}>
                <PayPalCommerceButton
                    containerId="paypalcommerceId"
                    deinitialize={noop}
                    initialize={initialize}
                    methodId="paypalcommerce"
                    onError={error}
                    onClick={jest.fn()}
                />
            </LocaleContext.Provider>
        );
    });

    it('renders as CheckoutButton', () => {
        const container = mount(<ButtonTest />);

        expect(container.find(CheckoutButton)).toHaveLength(1);
    });

    it('initializes the button correctly', () => {
        mount(<ButtonTest />);

        expect(initialize).toHaveBeenCalledWith({
            methodId: 'paypalcommerce',
            paypalcommerce: {
                container: 'paypalcommerceId',
                onComplete: navigateToOrderConfirmation,
                onClick: expect.any(Function),
                onError: error,
            },
        });
    });
});
