import React from 'react';

import { usePropsToOnMount } from './usePropsToOnMount';
import { Props } from './PPSDKPaymentMethod';
import { Wrapper } from './Wrapper';

export const NoUI = (props: Props) => {
    const onMount = usePropsToOnMount(props);

    return (<Wrapper onMount={ onMount } />);
};
