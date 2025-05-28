import React, { FunctionComponent, useEffect } from 'react';

interface Props {
    onMount(): () => void;
    children?: React.ReactNode;
}

export const Wrapper: FunctionComponent<Props> = (props) => {
    const { children, onMount } = props;

    useEffect(onMount, [onMount]);

    return <>{children}</>;
};
