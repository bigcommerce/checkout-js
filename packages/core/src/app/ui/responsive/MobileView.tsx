import React, { type FunctionComponent, memo } from 'react';

import ViewPicker from './ViewPicker';

type QueryResults = Record<string, boolean>;

const MobileView: FunctionComponent<{ children(matched: boolean): React.ReactNode }> = ({
  children,
}) => <ViewPicker>{(matches: QueryResults) => children(matches.mobile)}</ViewPicker>;

export default memo(MobileView);
