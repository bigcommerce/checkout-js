import { useEffect } from 'react';

import { usePropsToOnMount } from './usePropsToOnMount';
import { PPSDKPaymentMethod } from './PPSDKPaymentMethod';

export const NoUI: typeof PPSDKPaymentMethod = props => {
    const onMount = usePropsToOnMount(props);
    useEffect(onMount, [onMount]);

    return null;
};
