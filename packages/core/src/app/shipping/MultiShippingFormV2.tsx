import { Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useMemo, useState } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { withFormikExtended } from '../common/form';
import { EMPTY_ARRAY } from '../common/utility';
import { Button, ButtonVariant } from '../ui/button';

import ConsignmentListItem from './ConsignmentListItem';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import MultiShippingFormV2Footer from './MultiShippingFormV2Footer';
import './MultiShippingFormV2.scss';
import NewConsignment from './NewConsignment';

interface MultiShippingFormV2Values {
    orderComment: string;
}

export interface MultiShippingFormV2Props {
    customerMessage: string;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    onSubmit(values: MultiShippingFormV2Values): void;
}

const MultiShippingFormV2: FunctionComponent<MultiShippingFormV2Props> = ({
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError,
}: MultiShippingFormV2Props) => {
    const [addShippingDestination, setAddShippingDestination] = useState(false);

    const {
        checkoutState: {
            data: { getConsignments, getConfig },
        },
    } = useCheckout();

    const consignments = getConsignments() || EMPTY_ARRAY;
    const config = getConfig();

    const shouldDisableSubmit = useMemo(() => {
        return isLoading || !hasSelectedShippingOptions(consignments);
    }, [isLoading, consignments]);

    if (!config) {
        return null;
    }

    const {
        checkoutSettings: {
            enableOrderComments: shouldShowOrderComments,
        },
    } = config;

    const handleAddShippingDestination = () => {
        setAddShippingDestination(true);
    }

    return (
        <>
            {consignments.map((consignment: Consignment, index: number) => (
                <ConsignmentListItem
                    consignment={consignment}
                    consignmentNumber={index + 1}
                    countriesWithAutocomplete={countriesWithAutocomplete}
                    defaultCountryCode={defaultCountryCode}
                    isLoading={isLoading}
                    key={consignment.id}
                    onUnhandledError={onUnhandledError}
                />
            ))}
            {(consignments.length === 0 || addShippingDestination) && (
                <NewConsignment
                    consignmentNumber={consignments.length === 0 ? 1 : (consignments.length + 1)}
                    countriesWithAutocomplete={countriesWithAutocomplete}
                    defaultCountryCode={defaultCountryCode}
                    isLoading={isLoading}
                    onUnhandledError={onUnhandledError}
                />)
            }
            <Button className='add-consignment-button' onClick={handleAddShippingDestination} variant={ButtonVariant.Secondary}>
                Add shipping destination
            </Button>
            <MultiShippingFormV2Footer
                isLoading={isLoading}
                shouldDisableSubmit={shouldDisableSubmit}
                shouldShowOrderComments={shouldShowOrderComments}
            />
        </>
    );
}

export default withLanguage(
    withFormikExtended<MultiShippingFormV2Props & WithLanguageProps, MultiShippingFormV2Values>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ customerMessage }) => ({
            orderComment: customerMessage,
        }),
        enableReinitialize: true,
    })(MultiShippingFormV2),
);
