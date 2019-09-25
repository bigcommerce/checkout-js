import React, { memo, FunctionComponent } from 'react';
import Media, { MediaQueryObject, MultiQueryProps } from 'react-media';

import { MOBILE_MAX_WIDTH } from './breakpoints';

/*
* View Picker used for handling multiple media queries and render views based on matching media.
* Specify any number of media queries in the "queries" prop of <Media> component.
*
* @return: Returns an object with all keys of the "queries" prop in <Media> with matching ones as true.
*/
const ViewPicker: FunctionComponent<Pick<MultiQueryProps<MediaQueryObject>, 'children'>> = ({ children }) => {
    return (
        <Media queries={ { print: 'print',
                           small: `screen and (max-width: ${MOBILE_MAX_WIDTH}px)`,
                        } }
        >
            { children }
        </Media>
    );
};

export default memo(ViewPicker);
