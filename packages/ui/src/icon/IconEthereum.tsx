import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconEthereum: FunctionComponent = () => (
    <svg
        aria-labelledby="iconEthereumTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconEthereumTitle">Ethereum</title>
        <rect fill="white" height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
        <circle cx="34.87" cy="23.87" fill="#6481E7" r="15.87" />
        <path
            clipRule="evenodd"
            d="M35.0561 12.7036V28.724L42.1748 24.5157L35.0561 12.7036Z"
            fill="#C1CCF5"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M27.9368 24.5157L35.0555 28.724V12.7036L27.9368 24.5157Z"
            fill="white"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M35.056 21.2802L27.9369 24.5155L35.0556 28.7238L42.1747 24.516L35.056 21.2802Z"
            fill="#8299EC"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M35.0561 30.0718V35.8982L42.1795 25.8658L35.0561 30.0718Z"
            fill="#C1CCF5"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M35.056 21.2802L27.9369 24.5155L35.0556 28.7238L35.056 21.2802Z"
            fill="#C1CCF5"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M27.9369 25.8658L35.0556 35.8978V30.0718L27.9369 25.8658Z"
            fill="white"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconEthereum);
