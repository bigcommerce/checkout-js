import React, { type FunctionComponent, memo } from 'react';

import IconContainer, { type IconProps } from './IconContainer';

const IconCheckBoldSvg: FunctionComponent = () => (
    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 14.76L5.53 11.29l-2.12 2.12L9 19 21 7l-2.12-2.12z" />
    </svg>
);

const IconCheckBold: FunctionComponent<IconProps> = (props) => (
    <IconContainer {...props}>
        <IconCheckBoldSvg />
    </IconContainer>
);

export default memo(IconCheckBold);
