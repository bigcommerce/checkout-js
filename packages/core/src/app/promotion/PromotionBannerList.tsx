import { type Banner, type Promotion } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import PromotionBanner from './PromotionBanner';
import './PromotionBannerList.scss';

export interface PromotionBannerListProps {
    promotions?: Promotion[];
}

const PromotionBannerList: FunctionComponent<PromotionBannerListProps> = ({ promotions }) => {
    const banners = (promotions || []).reduce(
        (result, promotion) => [...result, ...promotion.banners],
        // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
        [] as Banner[],
    );

    if (!banners.length) {
        return null;
    }

    return (
        <div className="discountBanner">
            <ul className="discountBannerList">
                {banners.map((banner, index) => (
                    <PromotionBanner key={index} message={banner.text} />
                ))}
            </ul>
        </div>
    );
};

export default memo(PromotionBannerList);
