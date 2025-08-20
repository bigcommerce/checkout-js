import React, { type FunctionComponent, useEffect } from 'react';

interface Props {
    children?: React.ReactNode;
    onMount(): () => void;
}

export const Wrapper: FunctionComponent<Props> = (props) => {
    const { children, onMount } = props;

    useEffect(onMount, [onMount]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
