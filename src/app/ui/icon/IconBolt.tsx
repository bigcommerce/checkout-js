import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconBolt: FunctionComponent = () => (
    <svg height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 7.502h7.5v4.5L12 4.502H4.5V0z" fill="#FFFFFF" id="mark" />
    </svg>
);

export default withIconContainer(IconBolt);
