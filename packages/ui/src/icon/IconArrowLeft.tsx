import React, { type FunctionComponent, memo } from 'react';

import IconContainer, { type IconProps } from './IconContainer';

const IconArrowLeftSvg: FunctionComponent = () => (
    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
            clipRule="evenodd"
            d="M12.7071 5.29289C13.0976 5.68342 13.0976 6.31658 12.7071 6.70711L7.41421 12L12.7071 17.2929C13.0976 17.6834 13.0976 18.3166 12.7071 18.7071C12.3166 19.0976 11.6834 19.0976 11.2929 18.7071L5.29289 12.7071C4.90237 12.3166 4.90237 11.6834 5.29289 11.2929L11.2929 5.29289C11.6834 4.90237 12.3166 4.90237 12.7071 5.29289Z"
        />
        <path
            clipRule="evenodd"
            d="M20 12C20 12.5523 19.5523 13 19 13L6 13C5.44771 13 5 12.5523 5 12C5 11.4477 5.44771 11 6 11L19 11C19.5523 11 20 11.4477 20 12Z"
        />
    </svg>
);

const IconArrowLeft: FunctionComponent<IconProps> = (props) => (
    <IconContainer {...props}>
        <IconArrowLeftSvg />
    </IconContainer>
);

export default memo(IconArrowLeft);
