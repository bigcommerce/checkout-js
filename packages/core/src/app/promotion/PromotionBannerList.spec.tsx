import { shallow } from 'enzyme';
import React from 'react';

import PromotionBanner from './PromotionBanner';
import PromotionBannerList from './PromotionBannerList';
import { getPromotion } from './promotions.mock';

describe('PromotionBannerList', () => {
    it('renders list of promotion banners', () => {
        const promotions = [getPromotion()];
        const component = shallow(<PromotionBannerList promotions={promotions} />);

        expect(component.find(PromotionBanner)).toHaveLength(2);

        expect(component.find(PromotionBanner).at(0).prop('message')).toEqual(
            promotions[0].banners[0].text,
        );

        expect(component.find(PromotionBanner).at(1).prop('message')).toEqual(
            promotions[0].banners[1].text,
        );
    });

    it('renders nested promotion banners as flat list', () => {
        const promotions = [getPromotion(), getPromotion()];
        const component = shallow(<PromotionBannerList promotions={promotions} />);

        expect(component.find(PromotionBanner)).toHaveLength(4);

        expect(component.find(PromotionBanner).at(0).prop('message')).toEqual(
            promotions[0].banners[0].text,
        );

        expect(component.find(PromotionBanner).at(1).prop('message')).toEqual(
            promotions[0].banners[1].text,
        );

        expect(component.find(PromotionBanner).at(2).prop('message')).toEqual(
            promotions[1].banners[0].text,
        );

        expect(component.find(PromotionBanner).at(3).prop('message')).toEqual(
            promotions[1].banners[1].text,
        );
    });

    it('renders nothing if there are no banners', () => {
        const component = shallow(<PromotionBannerList promotions={[]} />);

        expect(component.html()).toBeNull();
    });

    it('renders nothing if there are no promotions', () => {
        const component = shallow(<PromotionBannerList />);

        expect(component.html()).toBeNull();
    });
});
