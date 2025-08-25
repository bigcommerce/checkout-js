import React, { useEffect } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import { usePropsToOnMount } from './usePropsToOnMount';

export const NoUI = (props: PaymentMethodProps) => {
    const onMount = usePropsToOnMount(props);

    useEffect(onMount, [onMount]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
};
