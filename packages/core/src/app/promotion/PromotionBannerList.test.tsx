import React from 'react';

import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import PromotionBannerList from './PromotionBannerList';
import { getPromotion } from './promotions.mock';

describe('PromotionBannerList', () => {
    it('renders list of promotion banners', () => {
        const promotions = [getPromotion()];

        render(<PromotionBannerList promotions={promotions} />);

        const promotionBanners = screen.getAllByTestId('promotion-banner-message');

        expect(promotionBanners).toHaveLength(2);
        expect(within(promotionBanners[0]).getByText(promotions[0].banners[0].text)).toBeInTheDocument();
        expect(within(promotionBanners[1]).getByText(promotions[0].banners[1].text)).toBeInTheDocument();
    });

    it('renders nested promotion banners as flat list', () => {
        const promotions = [getPromotion(), getPromotion()];

        render(<PromotionBannerList promotions={promotions} />);

        const promotionBanners = screen.getAllByTestId('promotion-banner-message');

        expect(promotionBanners).toHaveLength(4);
        expect(within(promotionBanners[0]).getByText(promotions[0].banners[0].text)).toBeInTheDocument();
        expect(within(promotionBanners[1]).getByText(promotions[0].banners[1].text)).toBeInTheDocument();
        expect(within(promotionBanners[2]).getByText(promotions[0].banners[0].text)).toBeInTheDocument();
        expect(within(promotionBanners[3]).getByText(promotions[0].banners[1].text)).toBeInTheDocument();
    });

    it('renders nothing if there are no banners', () => {
        render(<PromotionBannerList promotions={[]} />);

        expect(screen.queryByTestId('promotion-banner-message')).not.toBeInTheDocument();
    });

    it('renders nothing if there are no promotions', () => {
        render(<PromotionBannerList />);

        expect(screen.queryByTestId('promotion-banner-message')).not.toBeInTheDocument();
    });
});
