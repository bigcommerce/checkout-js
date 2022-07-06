import React, { useEffect, FunctionComponent } from 'react';

interface Props {
    onMount(): () => void;
}

export const Wrapper: FunctionComponent<Props> = props => {
    const { children, onMount } = props;

    useEffect(onMount, [onMount]);

    return <>{ children }</>;
};
