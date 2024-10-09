import { ConsignmentCreateRequestBody } from "@bigcommerce/checkout-sdk";
import { find } from "lodash";
import React, { useMemo, useState } from "react";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { EMPTY_ARRAY } from "../common/utility";

import ConsignmentAddressSelector from './ConsignmentAddressSelector';


interface NewConsignmentProps {
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
}

const NewConsignment = ({
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError
}: NewConsignmentProps) => {
    const [consignmentRequest, setConsignmentRequest] = useState<ConsignmentCreateRequestBody | undefined>();

    const {
        checkoutState: {
            data: { getShippingCountries },
        },
    } = useCheckout();

    const selectedAddress = useMemo(() => {
        if (!consignmentRequest?.address) {
            return undefined;
        }

        const countries = getShippingCountries() || EMPTY_ARRAY;
        const country = find(countries, { code: consignmentRequest.address.countryCode });

        return {
            ...consignmentRequest.address,
            country: country ? country.name : consignmentRequest.address.countryCode,
        };
    }, [consignmentRequest]);

    return (
        <div className='consignment-container'>
            <h3 className='consignment-header'>Shipping destination {consignmentNumber}</h3>
            <ConsignmentAddressSelector
                countriesWithAutocomplete={countriesWithAutocomplete}
                defaultCountryCode={defaultCountryCode}
                isLoading={isLoading}
                onUnhandledError={onUnhandledError}
                selectedAddress={selectedAddress}
                setConsignmentRequest={setConsignmentRequest} />
        </div>
    )
}

export default NewConsignment;