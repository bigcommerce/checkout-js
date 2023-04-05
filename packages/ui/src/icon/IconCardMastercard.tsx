import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardMastercard: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardMasterTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardMasterTitle">Master</title>
        <rect fill="white" height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
        <path
            clipRule="evenodd"
            d="M35.5 34.3139C33.1169 36.3704 30.0255 37.6119 26.6475 37.6119C19.1102 37.6119 13 31.4308 13 23.806C13 16.1811 19.1102 10 26.6475 10C30.0255 10 33.1169 11.2415 35.5 13.2981C37.8831 11.2415 40.9745 10 44.3525 10C51.8898 10 58 16.1811 58 23.806C58 31.4308 51.8898 37.6119 44.3525 37.6119C40.9745 37.6119 37.8831 36.3704 35.5 34.3139Z"
            fill="#ED0006"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M35.5 34.3139C38.4344 31.7816 40.2951 28.0136 40.2951 23.806C40.2951 19.5983 38.4344 15.8303 35.5 13.2981C37.8831 11.2415 40.9745 10 44.3524 10C51.8898 10 58 16.1811 58 23.806C58 31.4308 51.8898 37.6119 44.3524 37.6119C40.9745 37.6119 37.8831 36.3704 35.5 34.3139Z"
            fill="#F9A000"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M35.5 13.2981C38.4344 15.8304 40.2951 19.5983 40.2951 23.806C40.2951 28.0136 38.4344 31.7815 35.5 34.3138C32.5657 31.7815 30.705 28.0136 30.705 23.806C30.705 19.5983 32.5657 15.8304 35.5 13.2981Z"
            fill="#FF5E00"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconCardMastercard);
