import { type Consignment, type ConsignmentCreateRequestBody, type ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import classNames from "classnames";
import { find } from "lodash";
import React, { useMemo, useState } from "react";

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString } from "@bigcommerce/checkout/locale";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { EMPTY_ARRAY } from "../common/utility";

import AllocateItemsModal from "./AllocateItemsModal";
import ConsignmentAddressSelector from './ConsignmentAddressSelector';
import { AssignItemFailedError } from "./errors";
import { useMultiShippingConsignmentItems } from "./hooks/useMultishippingConsignmentItems";
import { setRecommendedOrMissingShippingOption } from './utils';

interface NewConsignmentProps {
    consignmentNumber: number;
    defaultCountryCode?: string;
    isLoading: boolean;
    setIsAddShippingDestination: React.Dispatch<React.SetStateAction<boolean>>;
    onUnhandledError(error: Error): void;
    resetErrorConsignmentNumber(): void;
}

const NewConsignment = ({
    consignmentNumber,
    defaultCountryCode,
    isLoading,
    onUnhandledError,
    resetErrorConsignmentNumber,
    setIsAddShippingDestination,
}: NewConsignmentProps) => {
    const [consignmentRequest, setConsignmentRequest] = useState<ConsignmentCreateRequestBody | undefined>();
    const [isOpenAllocateItemsModal, setIsOpenAllocateItemsModal] = useState(false);
    const { unassignedItems } = useMultiShippingConsignmentItems();
    const { themeV2 } = useThemeContext();
    const {
        checkoutState: {
            data: { getShippingCountries, getConsignments: getPreviousConsignments },
        },
        checkoutService: { assignItemsToAddress: assignItem, selectConsignmentShippingOption },
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
        let currentConsignments: Consignment[] | undefined;

        if (!selectedAddress) {
            return;
        }

        try {
            const {
                data: { getConsignments },
            } = await assignItem({
                address: selectedAddress,
                lineItems: consignmentLineItems,
            });

            currentConsignments = getConsignments();
        } catch (error) {
            if (error instanceof AssignItemFailedError) {
                onUnhandledError(error);
            }
        } finally {
            toggleAllocateItemsModal();
            setIsAddShippingDestination(false);
            resetErrorConsignmentNumber();

            if (currentConsignments && currentConsignments.length > 0) {
                await setRecommendedOrMissingShippingOption(
                    getPreviousConsignments() ?? [],
                    currentConsignments,
                    selectConsignmentShippingOption,
                );
            }
        }
    };

    return (
        <div className='consignment-container'>
            <div className={classNames('consignment-header', { 'sub-header': themeV2 })}>
                <h3>
                    <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
                </h3>
            </div>
            <ConsignmentAddressSelector
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
                    <h3 className={themeV2 ? 'body-bold' : ''}>
                        <TranslatedString id="shipping.multishipping_no_item_allocated_message" />
                    </h3>
                    <a
                        className={themeV2 ? 'body-cta' : ''}
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
