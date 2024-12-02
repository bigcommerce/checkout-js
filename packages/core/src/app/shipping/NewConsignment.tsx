import { ConsignmentCreateRequestBody, ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import { find } from "lodash";
import React, { useMemo, useState } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString } from "@bigcommerce/checkout/locale";
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
        } catch (error) {
            if (error instanceof AssignItemFailedError) {
                onUnhandledError(error);
            }
        } finally {
            toggleAllocateItemsModal();
            setIsAddShippingDestination(false);
        }
    };

    return (
        <div className='consignment-container'>
            <div className='consignment-header'>
                <h3>
                    <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
                </h3>
            </div>
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
                    isLoading={isLoading}
                    isOpen={isOpenAllocateItemsModal}
                    onAllocateItems={handleAllocateItems}
                    onRequestClose={toggleAllocateItemsModal}
                    unassignedItems={unassignedItems}
                />
                <div className="new-consignment-line-item-header">
                    <h3><TranslatedString id="shipping.multishipping_no_item_allocated_message" /></h3>
                    <a
                        data-test="allocate-items-button"
                        href="#"
                        onClick={preventDefault(toggleAllocateItemsModal)}
                    >
                        <TranslatedString id="shipping.multishipping_allocate_items" />
                    </a>
                </div>
            </>
            )}
        </div>
    )
}

export default NewConsignment;
