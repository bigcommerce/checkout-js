import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardCB: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardCBTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardCBTitle">CB</title>
        <g clipPath="url(#clip0_1367_1013)">
            <g clipPath="url(#clip1_1367_1013)">
                <path d="M-2 0H71.8462V48H-2V0Z" fill="url(#paint0_linear_1367_1013)" />
                <mask
                    height="23"
                    id="mask0_1367_1013"
                    maskUnits="userSpaceOnUse"
                    width="27"
                    x="10"
                    y="13"
                >
                    <path d="M10.8122 35.0769H36.6953V13.9753H10.8122V35.0769Z" fill="white" />
                </mask>
                <g mask="url(#mask0_1367_1013)">
                    <path
                        d="M23.7166 23.6307H36.6766C36.7135 22.3558 36.4885 21.0869 36.0153 19.9024C35.5422 18.7179 34.831 17.6432 33.9259 16.7446C31.5628 14.7138 27.4459 13.9753 23.7535 13.9753C19.9135 13.9753 15.6674 14.7876 13.2859 16.9661C12.3774 17.9913 11.6891 19.192 11.2635 20.494C10.838 21.796 10.6843 23.1715 10.812 24.5353C10.7445 26.0086 10.9837 27.4799 11.5144 28.8559C12.0451 30.2319 12.8558 31.4828 13.8951 32.5292C16.2397 34.5415 20.0612 35.0769 23.7535 35.0769C27.3351 35.0769 31.212 34.4676 33.5382 32.5661C34.6159 31.5339 35.4551 30.2788 35.9972 28.8885C36.5393 27.4981 36.7712 26.0062 36.6766 24.5169H23.7166V23.6307Z"
                        fill="white"
                    />
                </g>
                <path
                    d="M37.5445 24.517V34.597H55.5629C56.8396 34.5307 58.0421 33.9764 58.9217 33.0487C59.8013 32.121 60.2908 30.8908 60.2891 29.6123C60.2928 28.3206 59.8076 27.0754 58.9308 26.1268C58.0541 25.1781 56.8509 24.5964 55.5629 24.4985L37.5445 24.517ZM59.9752 19.0154C59.9802 18.408 59.8641 17.8056 59.6339 17.2434C59.4037 16.6812 59.0639 16.1705 58.6344 15.7409C58.2048 15.3113 57.6941 14.9715 57.1319 14.7413C56.5697 14.5111 55.9673 14.3951 55.3598 14.4C55.1695 14.3842 54.9785 14.3781 54.7875 14.3816H37.5445V23.6308H55.7106C56.8664 23.5295 57.9427 23 58.7283 22.1461C59.5138 21.2923 59.952 20.1757 59.9568 19.0154"
                    fill="white"
                />
                <rect height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
            </g>
        </g>
        <defs>
            <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_1367_1013"
                x1="3.07692"
                x2="66.7692"
                y1="-7.84615"
                y2="55.8462"
            >
                <stop stopColor="#289847" />
                <stop offset="0.49" stopColor="#1787B9" />
                <stop offset="1" stopColor="#1D3564" />
            </linearGradient>
            <clipPath id="clip0_1367_1013">
                <rect fill="white" height="48" width="70" />
            </clipPath>
            <clipPath id="clip1_1367_1013">
                <rect fill="white" height="48" rx="6" width="70" />
            </clipPath>
        </defs>
    </svg>
);

export default withIconContainer(IconCardCB);
