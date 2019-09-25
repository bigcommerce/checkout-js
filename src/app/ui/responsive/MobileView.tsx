import React, { memo, FunctionComponent } from 'react';

import ViewPicker from './ViewPicker';

const MobileView: FunctionComponent<{children(matched: boolean): React.ReactNode}> = ({ children }) => {
    return (
        <ViewPicker>
            { (matches: { mobile: boolean }) => {
                return children(matches.mobile);
            } }
        </ViewPicker>
    );
};

export default memo(MobileView);
