import { mount } from 'enzyme';
import React from 'react';

import ShippingOptionAdditionalDescription from './ShippingOptionAdditionalDescription';

describe('ShippingOptionAdditionalDescription Component', () => {
    it('renders additional description', () => {
        const component = mount(<ShippingOptionAdditionalDescription description="Test this" />);

        expect(component.find('.shippingOption-additionalDescription').text()).toBe('Test this');
    });

    it('renders additional description', () => {
        const longDescription = 'This is a really long description, it just goes on and on and on';
        const component = mount(
            <ShippingOptionAdditionalDescription description={longDescription} />,
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
