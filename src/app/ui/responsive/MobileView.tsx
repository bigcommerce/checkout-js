import React, { memo, FunctionComponent } from 'react';
import Media, { MediaProps } from 'react-media';

import { MOBILE_MAX_WIDTH } from './breakpoints';

const MobileView: FunctionComponent<Pick<MediaProps, 'children'>> = ({ children }) => {
    return (
        <Media query={ `(max-width: ${MOBILE_MAX_WIDTH}px)` }>
            { children }
        </Media>
    );
};

export default memo(MobileView);
