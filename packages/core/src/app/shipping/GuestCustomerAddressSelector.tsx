import { Address } from '@bigcommerce/checkout-sdk';
import React from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from "@bigcommerce/checkout/payment-integration-api";
import { IconEdit } from '@bigcommerce/checkout/ui';

import SingleLineStaticAddress from '../address/SingleLineStaticAddress';

interface GuestCustomerAddressSelectorProps {
    onUseNewAddress(): void;
    selectedAddress?: Address;
}

const GuestCustomerAddressSelector = ({ onUseNewAddress, selectedAddress }: GuestCustomerAddressSelectorProps) => {
    const { newFontStyle } = useStyleContext();

    return <div className='guest-consignment-line-item-header'>
        {
            !selectedAddress
                ? <>
                    <h3 className={newFontStyle ? 'body-bold' : ''}>
                        <TranslatedString id="shipping.guest_multishipping_no_shipping_address_message" />
                    </h3>
                    <a
                        className={newFontStyle ? 'body-cta' : ''}
                        data-test="enter-shipping-address"
                        href="#"
                        onClick={preventDefault(onUseNewAddress)}
                    >
                        <TranslatedString id="shipping.guest_multishipping_enter_shipping_address_action" />
                    </a>
                </>
                : <>
                    <SingleLineStaticAddress address={selectedAddress} />
                    <a
                        className={newFontStyle ? 'body-cta' : ''}
                        data-test="edit-shipping-address"
                        href="#"
                        onClick={preventDefault(onUseNewAddress)}
                    >
                        <IconEdit />
                    </a>
                </>
        }
    </div>;
}

export default GuestCustomerAddressSelector;
