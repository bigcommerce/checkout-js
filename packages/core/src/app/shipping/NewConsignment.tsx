import { ConsignmentCreateRequestBody, ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import { find } from "lodash";
import React, { useMemo, useState } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { EMPTY_ARRAY } from "../common/utility";

import AllocateItemsModal from "./AllocateItemsModal";
import ConsignmentAddressSelector from './ConsignmentAddressSelector';
import { AssignItemFailedError } from "./errors";
import { useMultiShippingConsignmentItems } from "./hooks/useMultishippingConsignmentItems";

interface NewConsignmentProps {
    consignmentNumber: number;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    setIsAddShippingDestination: React.Dispatch<React.SetStateAction<boolean>>
}

const NewConsignment = ({
    consignmentNumber,
    countriesWithAutocomplete,
    defaultCountryCode,
    isLoading,
    onUnhandledError,
    setIsAddShippingDestination,
}: NewConsignmentProps) => {
    const [consignmentRequest, setConsignmentRequest] = useState<ConsignmentCreateRequestBody | undefined>();
    const [isOpenAllocateItemsModal, setIsOpenAllocateItemsModal] = useState(false);
    const { unassignedItems } = useMultiShippingConsignmentItems();

    const {
        checkoutState: {
            data: { getShippingCountries },
        },
        checkoutService: { assignItemsToAddress: assignItem },
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


    const toggleAllocateItemsModal = () => {
        setIsOpenAllocateItemsModal(!isOpenAllocateItemsModal);
    }

    const handleAllocateItems = async (consignmentLineItems: ConsignmentLineItem[]) => {
        if (!selectedAddress) {
            return;
        }

        try {
            await assignItem({
                address: selectedAddress,
                lineItems: consignmentLineItems,
            });
            setIsAddShippingDestination(false);
        } catch (error) {
            if (error instanceof AssignItemFailedError) {
                onUnhandledError(error);
            }
        } finally {
            toggleAllocateItemsModal();
        }
    };

    return (
        <div className='consignment-container'>
            <h3 className='consignment-header'>Destination #{consignmentNumber}</h3>
            <ConsignmentAddressSelector
                countriesWithAutocomplete={countriesWithAutocomplete}
                defaultCountryCode={defaultCountryCode}
                isLoading={isLoading}
                onUnhandledError={onUnhandledError}
                selectedAddress={selectedAddress}
                setConsignmentRequest={setConsignmentRequest}
            />
            {selectedAddress && (<>
                <AllocateItemsModal
                    address={selectedAddress}
                    consignmentNumber={consignmentNumber}
                    isOpen={isOpenAllocateItemsModal}
                    onAllocateItems={handleAllocateItems}
                    onRequestClose={toggleAllocateItemsModal}
                    unassignedItems={unassignedItems}
                />
                <div className="new-consignment-line-item-header">
                    <p>No items allocated</p>
                    <a
                        data-test="allocate-items-button"
                        href="#"
                        onClick={preventDefault(toggleAllocateItemsModal)}
                    >
                        Allocate items
                    </a>
                </div>
            </>
            )}
        </div>
    )
}

export default NewConsignment;
