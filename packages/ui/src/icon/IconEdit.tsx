import React, { type FunctionComponent, memo } from 'react';

import IconContainer, { type IconProps } from './IconContainer';

const IconEditSvg: FunctionComponent = () => (
    <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.49902 14.5511V17.0844C2.49902 17.3178 2.68236 17.5011 2.91569 17.5011H5.44902C5.55736 17.5011 5.66569 17.4594 5.74069 17.3761L14.8407 8.28444L11.7157 5.15944L2.62402 14.2511C2.54069 14.3344 2.49902 14.4344 2.49902 14.5511ZM17.2574 5.86777C17.5824 5.54277 17.5824 5.01777 17.2574 4.69277L15.3074 2.74277C14.9824 2.41777 14.4574 2.41777 14.1324 2.74277L12.6074 4.26777L15.7324 7.39277L17.2574 5.86777Z" />
    </svg>
);

const IconEdit: FunctionComponent<IconProps> = (props) => (
    <IconContainer {...props}>
        <IconEditSvg />
    </IconContainer>
);

export default memo(IconEdit);
