import React from 'react';

import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import { usePropsToOnMount } from './usePropsToOnMount';
import { Wrapper } from './Wrapper';

export const NoUI = (props: PaymentMethodProps) => {
    const onMount = usePropsToOnMount(props);

    return <Wrapper onMount={onMount} />;
};
