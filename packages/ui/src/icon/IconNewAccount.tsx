import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconNewAccount: FunctionComponent = () => (
    <svg height="25" viewBox="0 0 35 25" width="35" xmlns="http://www.w3.org/2000/svg">
        <path
            clipRule="evenodd"
            d="M33 2H2L2 23H33V2ZM2 0C0.895431 0 0 0.89543 0 2V23C0 24.1046 0.89543 25 2 25H33C34.1046 25 35 24.1046 35 23V2C35 0.89543 34.1046 0 33 0H2Z"
            fill="#D1D7E0"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M11 12C11 11.4477 11.4477 11 12 11H24C24.5523 11 25 11.4477 25 12V14C25 14.5523 24.5523 15 24 15H12C11.4477 15 11 14.5523 11 14V12Z"
            fill="#D1D7E0"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M19 6C19.5523 6 20 6.44772 20 7V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V7C16 6.44772 16.4477 6 17 6H19Z"
            fill="#D1D7E0"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconNewAccount);
