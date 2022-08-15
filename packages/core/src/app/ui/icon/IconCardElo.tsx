import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardElo: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardEloTitle"
        role="img"
        viewBox="0 0 40 26"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardEloTitle">Elo</title>
        <mask height="7.7" id="a" maskUnits="userSpaceOnUse" width="3.2" x="5.8" y="10">
            <path d="M5.8 10v7.7H9V10H5.7z" fill="#fff" />
        </mask>
        <mask height="4.6" id="b" maskUnits="userSpaceOnUse" width="6.8" x="9.2" y="14.4">
            <path d="M9.2 19H16v-4.6H9.2V19z" fill="#fff" />
        </mask>
        <rect fill="#000" height="26" rx="3" width="40" />
        <path d="M24.8 13.8a3.3 3.3 0 10-5.9 2.6l3.3-1.4 1.3-.6zm-5 1v-.2a1.9 1.9 0 013.3-1.2zm4.1 2.2a3.2 3.2 0 01-4 .4l.7-1.2A1.9 1.9 0 0023 16zm1.4-.8V10h1.1v6a.1.1 0 00.1.1l1 .4-.4 1.2-1.2-.5c-.5-.2-.6-.5-.6-1" />
        <g mask="url(#a)">
            <path d="M9 11.6A3 3 0 009 16l-1.5 1.6a5.2 5.2 0 010-7.7L9 11.6z" fill="#289ad3" />
        </g>
        <g mask="url(#b)">
            <path d="M16 14.8a5.2 5.2 0 01-6.8 3.9l.7-2a3 3 0 004-2.3z" fill="#ec442d" />
        </g>
        <path d="M16 12.8l-2.1.5a3 3 0 00-4-2.3l-.7-2a5.2 5.2 0 016.8 3.8" fill="#fdda2e" />
        <path
            d="M29.5 13.2a1.9 1.9 0 000 2.8l-.9 1a3.2 3.2 0 010-4.8l1 1zm4.3 2a3.2 3.2 0 01-4.1 2.3l.4-1.2a1.9 1.9 0 002.5-1.4zm0-1.3l-1.2.3a1.9 1.9 0 00-2.5-1.4l-.4-1.2a3.2 3.2 0 014.1 2.3"
            fill="#fff"
        />
    </svg>
);

export default withIconContainer(IconCardElo);
