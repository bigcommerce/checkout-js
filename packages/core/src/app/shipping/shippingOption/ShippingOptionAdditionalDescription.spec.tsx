import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';

import ShippingOptionAdditionalDescription from './ShippingOptionAdditionalDescription';

describe('ShippingOptionAdditionalDescription Component', () => {
    const checkoutService = createCheckoutService();

    it('renders additional description', () => {
        const component = mount(<LocaleProvider checkoutService={checkoutService}><ShippingOptionAdditionalDescription description="Test this" /></LocaleProvider>);

        expect(component.find('.shippingOption-additionalDescription').text()).toBe('Test this');
    });

    it('renders additional description', () => {
        const longDescription = 'This is a really long description, it just goes on and on and on';
        const component = mount(
            <LocaleProvider checkoutService={checkoutService}><ShippingOptionAdditionalDescription description={longDescription} /></LocaleProvider>,
        );

        expect(
            component
                .find('.shippingOption-additionalDescription')
                .hasClass('shippingOption-additionalDescription--collapsed'),
        ).toBe(true);

        component.find('.shippingOption-readMore').simulate('click');

        expect(
            component
                .find('.shippingOption-additionalDescription')
                .hasClass('shippingOption-additionalDescription--expanded'),
        ).toBe(true);
    });
});
