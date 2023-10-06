import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconChevronRight: FunctionComponent = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier"><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 7 5 5-5 5"></path></g>
    </svg>

);

export default withIconContainer(IconChevronRight);
