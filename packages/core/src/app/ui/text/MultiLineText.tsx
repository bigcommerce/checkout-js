import React, { Fragment, FunctionComponent } from 'react';

const MultiLineText: FunctionComponent<{ children: string }> = ({ children }) => (
    <>
        {children.split('\n').map((line, key) => (
            <Fragment key={key}>
                {line}
                <br />
            </Fragment>
        ))}
    </>
);

export default MultiLineText;
