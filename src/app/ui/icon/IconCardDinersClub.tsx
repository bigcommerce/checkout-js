import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardDinersClub: FunctionComponent = () => (
    <svg width="152" height="104" viewBox="0 0 152 104" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
            <rect id="a" width="152" height="104" rx="12" />
        </defs>
        <g fill="none" fillRule="evenodd">
            <mask id="b" fill="#fff">
                <use xlinkHref="#a" />
            </mask>
            <use fill="#F4F4F4" xlinkHref="#a" />
            <rect fill="#F4F4F4" mask="url(#b)" x="1" width="152" height="104" rx="12" />
            <g transform="translate(42 26)">
                <ellipse fill="#009FDA" cx="26.716" cy="26" rx="26" ry="26" />
                <path d="M24.116 0c13 0 25.997 11.643 25.997 26 0 14.355-12.997 26-25.997 26V0z" fill="#009FDA" />
                <path d="M24.116 52V0H42.75c13 0 25.997 11.643 25.997 26 0 14.355-12.997 26-25.997 26H24.116z" fill="#009FDA" />
                <circle fill="#F3F4F4" cx="25.255" cy="27.139" r="24.539" />
                <path d="M38.255 24.983c0-7.09-6.34-13.02-11.54-14.583v29.167c5.2-1.563 11.54-7.488 11.54-14.584zM5.916 24.986c0 7.09 6.34 13.02 11.54 14.583V10.4c-5.2 1.565-11.54 7.493-11.54 14.586z" fill="#009FDA" />
            </g>
        </g>
    </svg>
);

export default withIconContainer(IconCardDinersClub);
