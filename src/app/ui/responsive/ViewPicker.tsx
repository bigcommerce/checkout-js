import React, { memo, FunctionComponent } from 'react';
import Media, { MediaQueryObject, MultiQueryProps } from 'react-media';

import { MOBILE_MAX_WIDTH } from './breakpoints';

const ViewPicker: FunctionComponent<Pick<MultiQueryProps<MediaQueryObject>, 'children'>> = ({ children }) => {
    return (
        <Media queries={ { print: 'print', small: `screen (max-width: ${MOBILE_MAX_WIDTH}px)` } }>
            { children }
        </Media>
    );
};

export default memo(ViewPicker);
