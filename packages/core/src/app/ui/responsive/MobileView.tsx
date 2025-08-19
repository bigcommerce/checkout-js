import React, { type FunctionComponent, memo } from 'react';

import ViewPicker from './ViewPicker';

interface QueryResults {
    [key: string]: boolean;
}

const MobileView: FunctionComponent<{ children(matched: boolean): React.ReactNode }> = ({
    children,
}) => {
    return (
        <ViewPicker>
            {(matches: QueryResults) => {
                return children(matches.mobile);
            }}
        </ViewPicker>
    );
};

export default memo(MobileView);
