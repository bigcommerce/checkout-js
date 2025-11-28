import React, { type FunctionComponent } from 'react';

const IconCoupon: FunctionComponent = () => {
    return (
        <svg
            className="coupon-icon"
            fill="none"
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <mask
                height="16"
                id="mask0_4221_16176"
                maskUnits="userSpaceOnUse"
                style={{ maskType: 'alpha' }}
                width="16"
                x="0"
                y="0"
            >
                <rect fill="#D9D9D9" height="16" width="16" />
            </mask>
            <g mask="url(#mask0_4221_16176)">
                <path
                    className="icon-path"
                    d="M7.40595 14.6654L1.3252 8.5782L8.24186 1.66797H14.3226V7.74872L7.40595 14.6654ZM11.8379 4.87692C12.0397 4.87692 12.2128 4.80335 12.3572 4.6562C12.5017 4.50906 12.5739 4.33673 12.5739 4.13922C12.5739 3.93957 12.5019 3.76753 12.358 3.62309C12.214 3.47865 12.0412 3.40644 11.8394 3.40644C11.6376 3.40644 11.4645 3.4784 11.32 3.62234C11.1756 3.76628 11.1034 3.93807 11.1034 4.13772C11.1034 4.33736 11.1754 4.51047 11.3193 4.65705C11.4632 4.80363 11.6361 4.87692 11.8379 4.87692ZM7.39855 13.5782L13.5662 7.40874V2.42437H8.57401L2.41236 8.59487L7.39855 13.5782Z"
                    fill="#979797"
                />
            </g>
        </svg>
    );
};

export default IconCoupon;
