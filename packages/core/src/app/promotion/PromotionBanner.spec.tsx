import { shallow } from 'enzyme';
import React from 'react';

import { Alert, AlertType } from '../ui/alert';

import PromotionBanner from './PromotionBanner';

describe('PromotionBanner', () => {
    it('renders message as info alert', () => {
        const component = shallow(<PromotionBanner message="Hello world" />);

        expect(component.find(Alert)).toHaveLength(1);

        expect(component.find(Alert).prop('type')).toEqual(AlertType.Info);
    });

    it('renders alert message as HTML', () => {
        const component = shallow(<PromotionBanner message="<strong>Hello world</strong>" />);

        expect(component.find('[data-test="promotion-banner-message"]').html()).toContain(
            '<strong>Hello world</strong>',
        );
    });
});
