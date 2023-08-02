import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconPayPalConnectSmall: FunctionComponent = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
        <circle cx="12" cy="12" r="12" fill="#F1F1F1" />
        <g>
            <g>
                <path
                    fill="#313131"
                    d="M8.6,12.9V9.5H7.3c-0.8,0-1.4,0.7-1.4,1.6v4.7c0,0.9,0.6,1.6,1.4,1.6h6.6c0.8,0,1.4-0.7,1.4-1.6v-1.3h-5.3
                    C9.3,14.5,8.6,13.8,8.6,12.9z"
                />
                <path
                    fill="#5B5B5B"
                    d="M16.7,6.5h-6.6c-0.8,0-1.4,0.7-1.4,1.6v1.3h5.3c0.8,0,1.4,0.7,1.4,1.6v3.4h1.3c0.8,0,1.4-0.7,1.4-1.6V8.2
                    C18.1,7.2,17.5,6.5,16.7,6.5z"
                />
            </g>
            <path
                fill="#DBDBDB"
                d="M13.9,9.5H8.6v3.4c0,0.9,0.6,1.6,1.4,1.6h5.3v-3.4C15.4,10.2,14.7,9.5,13.9,9.5z"
            />
        </g>
    </svg>
);

export default withIconContainer(IconPayPalConnectSmall);
