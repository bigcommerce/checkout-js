import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardHipercard: FunctionComponent = () => (
    <svg aria-labelledby="iconCardHiperTitle" role="img" viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg">
        <title id="iconCardHiperTitle">Hiper</title>
        <mask height="26.1" id="a" maskUnits="userSpaceOnUse" width="41.4" x="-.7" y="0">
            <rect fill="#fff" height="26.1" rx="2.5" width="41.4" x="-.7" />
        </mask>
        <mask height="6.2" id="b" maskUnits="userSpaceOnUse" width="3.9" x="31.4" y="10.3">
            <path d="M35.2 16.5v-6.2h-3.8v6.2h3.8z" fill="#fff" />
        </mask>
        <mask height="1.9" id="c" maskUnits="userSpaceOnUse" width="2" x="15" y="7.8">
            <path d="M17 7.8h-2v2h2z" fill="#fff" />
        </mask>
        <rect fill="#d26528" height="26" rx="3" width="40" />
        <g mask="url(#a)">
            <path d="M12 8.1v3.3H9V8h-2v8.4h2V13h3.2v3.5H14V8.1h-2zm14.7 4.7a1.3 1.3 0 011.2-1.2 1.1 1.1 0 011.1 1.2zm4 1.3a4.4 4.4 0 00.1-.8c0-1.5-.8-3-2.8-3a3 3 0 00-3.1 3.3c0 1.9 1.2 3 3.3 3a6.2 6.2 0 002.2-.3l-.2-1.3a5.6 5.6 0 01-1.7.3c-1 0-1.7-.4-1.8-1.2z" fill="#fff" />
            <g mask="url(#b)">
                <path d="M31.4 16.5h2v-3a2.2 2.2 0 010-.5 1.2 1.2 0 011.3-1 2.8 2.8 0 01.5.1v-1.8a2 2 0 00-.4 0 1.8 1.8 0 00-1.7 1.3v-1.2h-1.7v2z" fill="#fff" />
            </g>
            <g mask="url(#c)">
                <path d="M16 7.8a1 1 0 11-1 1 1 1 0 011-1" fill="#fde600" />
            </g>
            <path d="M15 10.4h2V14A1.1 1.1 0 0018 15v-4.7h1.6l.1 1c.8-1.6 3.3-1.3 4.1 0 .9 1.4 1.2 5.2-2.9 5.2h-1v2.3h-1.9v-2.3c-2.1 0-3.1-1.3-3.1-2.7zm5 4.7h1a1.3 1.3 0 001.4-1.2c0-.7 0-2.1-1.2-2.1-1.4 0-1.2 1.8-1.2 2.7v.6z" fill="#fff" />
        </g>
    </svg>
);

export default withIconContainer(IconCardHipercard);
