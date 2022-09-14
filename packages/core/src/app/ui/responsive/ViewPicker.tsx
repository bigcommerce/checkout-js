import React, { FunctionComponent, memo } from 'react';
import Media, { MediaQueryObject, MultiQueryProps } from 'react-media';

import { MOBILE_MAX_WIDTH } from './breakpoints';

const queries = {
    print: 'print',
    mobile: `screen and (max-width: ${MOBILE_MAX_WIDTH}px)`,
};

const ViewPicker: FunctionComponent<Pick<MultiQueryProps<MediaQueryObject>, 'children'>> = ({
    children,
}) => {
    return <Media queries={queries}>{children}</Media>;
};

export default memo(ViewPicker);
