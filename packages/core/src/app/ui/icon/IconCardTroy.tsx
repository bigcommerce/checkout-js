import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCardTroy: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardToryTitle"
        role="img"
        viewBox="0 0 40 26"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardTroyTitle">Troy</title>
        <rect fill="#fff" height="26" rx="3" width="40" />
        <path
            d="M37 8h1l-1-1-2 1a1 1 0 00-2 0l-1 3-1 2-1-5-1-1h-2v1l2 8a2 2 0 01-2 2h-1a1 1 0 00-1 1v2s-1 0 0 0a20 20 0 003 0 5 5 0 001 0 5 5 0 003-3l5-9a5 5 0 000-1zM7 17l1-1v-1-1l-2-1 1-2 1-1 1-1-1-2H7l1-1-1-1H5L4 7 3 8v1 1l1 1-1 3a2 2 0 002 3 6 6 0 002 0zm6-8l-1-2h-1l-1 1-1 9h3l1-4c0-2 1-2 3-2v-1l1-2-1-1a4 4 0 00-2 1 10 10 0 00-1 1zm4 3a5 5 0 003 5v-1a15 15 0 011-2 1 1 0 00-1 0 2 2 0 011-3 2 2 0 001-2V8l-1-1a5 5 0 00-4 5zm9 0a5 5 0 00-3-4v2a1 1 0 000 1 2 2 0 010 3 2 2 0 00-1 1l-1 1 1 1a5 5 0 004-5z"
            fill="#fefefe"
        />
        <path
            d="M25 21v-2a1 1 0 011-1h1a2 2 0 002-2l-2-8V7h2l1 1 1 5 1-2 1-3a1 1 0 012 0h2a5 5 0 010 1l-5 9a5 5 0 01-3 3 5 5 0 01-1 0h-1-2zM7 17a6 6 0 01-2 0 2 2 0 01-2-3l1-3-1-1V9 8l1-1 1-2h2l1 1-1 1h1l1 2-2 1v1l-1 2 2 1v2l-1 1zm6-8a10 10 0 011-1 4 4 0 012-1l1 1a65 65 0 00-1 2c-2 1-3 1-3 3l-1 4H9l1-9 1-1h1l1 2z"
            fill="#495355"
        />
        <path
            d="M17 12a5 5 0 014-5l1 1v1a2 2 0 01-1 2 2 2 0 00-1 3 1 1 0 011 0 15 15 0 00-1 2v1a5 5 0 01-3-5zm9 0a5 5 0 01-4 5l-1-1 1-1a2 2 0 011-1 2 2 0 000-3 1 1 0 010-1V8a5 5 0 013 4z"
            fill="#04aec3"
        />
        <path d="M25 21h3a20 20 0 01-3 0c-1 0 0 0 0 0z" fill="#656c6f" />
        <path d="M37 8h-2l2-1 1 1h-1z" fill="#3f484b" />
    </svg>
);

export default withIconContainer(IconCardTroy);
