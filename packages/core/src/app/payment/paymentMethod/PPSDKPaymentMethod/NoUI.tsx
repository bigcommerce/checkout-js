import React from 'react';

import { Props } from './PPSDKPaymentMethod';
import { usePropsToOnMount } from './usePropsToOnMount';
import { Wrapper } from './Wrapper';

export const NoUI = (props: Props) => {
    const onMount = usePropsToOnMount(props);

    return <Wrapper onMount={onMount} />;
};
