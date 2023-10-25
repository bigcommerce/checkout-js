import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconAch: FunctionComponent = () => (
    <svg viewBox="25 0 50 48" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
        <title id="iconAchTitle">ACH</title>
        <path
            d="M30 9.5h40c1.9 0 3.5 1.6 3.5 3.5v22c0 1.9-1.6 3.5-3.5 3.5H30c-1.9 0-3.5-1.6-3.5-3.5V13c0-1.9 1.6-3.5 3.5-3.5z"
            fill="#1524d9"
        />
        <path
            d="m45.2 27.5-.6-1.4h-2.7l-.5 1.4h-1.8l3-7.1h1.7l2.8 7.1h-1.9zm-1.9-5.1-.9 2.4h1.8l-.9-2.4zm9.1 5c-.5.2-1 .3-1.6.3-.5 0-1-.1-1.5-.3-.9-.3-1.6-1-2-1.9-.4-1-.4-2 0-3 .2-.4.5-.8.8-1.2.4-.3.8-.6 1.2-.7 1-.4 2-.4 3 0 .4.2.9.4 1.2.8l-1.2 1.2c-.2-.2-.4-.4-.6-.5-.3-.1-.5-.2-.8-.2-.3 0-.6 0-.8.2-.2.1-.5.3-.6.5-.2.2-.3.4-.4.7-.1.3-.2.6-.1.9 0 .3 0 .6.1.9.1.3.2.5.4.7.2.2.4.3.6.4.3.1.5.2.8.2.3 0 .6-.1.9-.2.2-.1.5-.3.6-.5l1.2 1.1c-.3.1-.7.4-1.2.6zm6.4.1v-2.9H56v2.9h-1.7v-7.1H56v2.7h2.8v-2.7h1.7v7l-1.7.1z"
            fill="#fff"
        />
    </svg>
);

export default withIconContainer(IconAch);
