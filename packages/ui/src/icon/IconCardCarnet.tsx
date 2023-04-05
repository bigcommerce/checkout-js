import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardCarnet: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardCarnetTitle"
        role="img"
        viewBox="0 0 40 26"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardCarnetTitle">Carnet</title>
        <mask height="14.93" id="a" maskUnits="userSpaceOnUse" width="26.89" x="6.98" y="5.07">
            <path d="M33.87 5.07H6.97q5.0 5.5V20h26.9V5.07z" fill="#fff" />
        </mask>
        <rect fill="#e8242f" height="26" rx="3" width="40" />
        <g>
            <path
                d="M13 18.5l.7-1.4.7 1.4zm.2-2.2l-1.8 3.6h1l.4-.8h1.9l.4.8h1l-1.9-3.6zm5 1.5h-.6v-1H19a.6.6 0 01.4.2.4.4 0 010 .3.4.4 0 010 .3.5.5 0 01-.3.2 4.5 4.5 0 01-.8 0zm1.5.8a2.2 2.2 0 00-.5-.3 1.7 1.7 0 001-.3.9.9 0 00.3-.7.9.9 0 00-.2-.6 1 1 0 00-.6-.4 4.3 4.3 0 00-1 0h-2v3.6h.9v-1.5h.2a2 2 0 01.4 0 .8.8 0 01.3.2 5.6 5.6 0 01.5.5l.7.8h1.1l-.5-.7a4.3 4.3 0 00-.6-.6zm7.4-.3h2.3v-.6h-2.3v-.8h2.5v-.7H26V20h3.6v-.6H27zm3-2v.6h1.4v3h1v-3h1.4v-.7zM9.7 19.1a1.1 1.1 0 01-.6.2 1.2 1.2 0 01-.8-.3 1.3 1.3 0 01-.4-1 1.2 1.2 0 01.4-1 1.2 1.2 0 01.8-.3 1.2 1.2 0 01.7.2.8.8 0 01.3.4l1-.1a1.4 1.4 0 00-.5-.7 2.3 2.3 0 00-1.4-.4 2.4 2.4 0 00-1.6.5A1.8 1.8 0 007 18a1.7 1.7 0 00.6 1.4A2.3 2.3 0 009 20a2.4 2.4 0 001.3-.3 1.6 1.6 0 00.7-.9l-1-.2a1 1 0 01-.4.6zm14.5-.5l-2-2.5h-.8V20h.8v-2.4l2 2.4h.9v-3.6h-.9zM20.4 6.8c4.6 0 8.4 1.8 9.2 4.1a2.8 2.8 0 00.1-.8c0-2.8-4.2-5-9.3-5-5.2 0-9.4 2.2-9.4 5a2.8 2.8 0 00.1.8c.8-2.3 4.6-4.1 9.3-4.1zm0 3c4.6 0 8.4 1.8 9.2 4a2.8 2.8 0 00.1-.8c0-2.7-4.2-5-9.3-5-5.2 0-9.4 2.3-9.4 5a2.8 2.8 0 00.1.9c.8-2.3 4.6-4.1 9.3-4.1z"
                fill="#fff"
            />
        </g>
    </svg>
);

export default withIconContainer(IconCardCarnet);
