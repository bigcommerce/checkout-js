import React, { type FunctionComponent } from 'react';

interface IconRemoveCouponProps {
    onClick?: () => void;
}

const IconRemoveCoupon: FunctionComponent<IconRemoveCouponProps> = ({ onClick }) => {
    return (
        <svg
            className="remove-coupon-icon"
            fill="none"
            height="20"
            onClick={onClick}
            viewBox="0 0 20 20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_4221_14238)">
                <path
                    className="icon-path"
                    d="M15.2496 4.7599C14.9246 4.4349 14.3996 4.4349 14.0746 4.7599L9.99961 8.82656L5.92461 4.75156C5.59961 4.42656 5.07461 4.42656 4.74961 4.75156C4.42461 5.07656 4.42461 5.60156 4.74961 5.92656L8.82461 10.0016L4.74961 14.0766C4.42461 14.4016 4.42461 14.9266 4.74961 15.2516C5.07461 15.5766 5.59961 15.5766 5.92461 15.2516L9.99961 11.1766L14.0746 15.2516C14.3996 15.5766 14.9246 15.5766 15.2496 15.2516C15.5746 14.9266 15.5746 14.4016 15.2496 14.0766L11.1746 10.0016L15.2496 5.92656C15.5663 5.6099 15.5663 5.07656 15.2496 4.7599Z"
                    fill="#999999"
                />
            </g>
            <defs>
                <clipPath id="clip0_4221_14238">
                    <rect fill="white" height="20" width="20" />
                </clipPath>
            </defs>
        </svg>
    );
};

export default IconRemoveCoupon;
