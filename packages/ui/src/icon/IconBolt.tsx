import React, { type FunctionComponent, memo } from 'react';

import IconContainer, { type IconProps } from './IconContainer';

const IconBoltSvg: FunctionComponent = () => (
    <svg
        aria-labelledby="iconCardBoltTitle"
        height="12"
        role="img"
        viewBox="0 0 12 12"
        width="12"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title id="iconCardBoltTitle">Bolt</title>
        <path d="M0 7.502h7.5v4.5L12 4.502H4.5V0z" fill="#FFFFFF" id="mark" />
    </svg>
);

const IconBolt: FunctionComponent<IconProps> = (props) => (
    <IconContainer {...props}>
        <IconBoltSvg />
    </IconContainer>
);

export default memo(IconBolt);
