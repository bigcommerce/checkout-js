import React, { Fragment, type FunctionComponent } from 'react';

export const MultiLineText: FunctionComponent<{ children: string }> = ({ children }) => (
    <>
        {children.split('\n').map((line, key) => (
            <Fragment key={key}>
                {line}
                <br />
            </Fragment>
        ))}
    </>
);
