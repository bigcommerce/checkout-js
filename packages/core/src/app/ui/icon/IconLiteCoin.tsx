import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconLiteCoin: FunctionComponent = () => (
    <svg
        aria-labelledby="iconLiteCoinTitle"
        fill="none"
        height="48"
        viewBox="0 0 70 48"
        width="70"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconLiteCoinTitle">Lite Coin</title>
        <rect fill="white" height="47" rx="5.5" stroke="#D9D9D9" width="69" x="0.5" y="0.5" />
        <path
            clipRule="evenodd"
            d="M50.74 23.87C50.74 32.6348 43.6348 39.74 34.87 39.74C26.1052 39.74 19 32.6348 19 23.87C19 15.1052 26.1052 8 34.87 8C43.6348 8 50.74 15.1052 50.74 23.87ZM30.9996 23.87L33.3215 15.1608H38.3537L36.6119 21.9348L38.9346 20.9672L38.3537 23.0958L36.0309 23.87L34.87 28.128H43.1926L42.4183 31.2241H29.0635L30.4187 25.9985L28.4835 26.7728L29.0635 24.6443L30.9996 23.87Z"
            fill="#A5A8A9"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconLiteCoin);
