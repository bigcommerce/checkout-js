import React, { memo, FunctionComponent } from 'react';

import ViewPicker from './ViewPicker';

const MobileView: FunctionComponent<{children(matched: boolean): React.ReactNode}> = ({ children }) => {
    return (
        <ViewPicker>
            { (matches: { small: boolean }) => {
                return children(matches.small);
            } }
        </ViewPicker>
    );
};

export default memo(MobileView);
