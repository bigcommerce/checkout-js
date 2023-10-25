import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCloseWithBorder: FunctionComponent = () => (
    <svg fill="none" height="37" viewBox="0 0 38 37" width="38" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M38 18.5C38 28.7173 29.7173 37 19.5 37C9.28273 37 1 28.7173 1 18.5C1 8.28273 9.28273 0 19.5 0C29.7173 0 38 8.28273 38 18.5Z"
            fill="#F3F3F3"
        />
        <path
            clipRule="evenodd"
            d="M24.6671 24.6674L12.9998 13.0002L14.4141 11.5859L26.0813 23.2532L24.6671 24.6674Z"
            fill="black"
            fillRule="evenodd"
        />
        <path
            clipRule="evenodd"
            d="M25.6674 13.0004L14.0002 24.6676L12.5859 23.2534L24.2532 11.5862L25.6674 13.0004Z"
            fill="black"
            fillRule="evenodd"
        />
    </svg>
);

export default withIconContainer(IconCloseWithBorder);
