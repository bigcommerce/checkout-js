import { type Address } from '@bigcommerce/checkout-sdk';
import React from "react";

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconEdit } from '@bigcommerce/checkout/ui';

import SingleLineStaticAddress from '../address/SingleLineStaticAddress';

interface GuestCustomerAddressSelectorProps {
    onUseNewAddress(): void;
    selectedAddress?: Address;
}

const GuestCustomerAddressSelector = ({ onUseNewAddress, selectedAddress }: GuestCustomerAddressSelectorProps) => {
    const { themeV2 } = useThemeContext();

    return <div className='guest-consignment-line-item-header'>
        {
            !selectedAddress
                ? <>
                    <h3 className={themeV2 ? 'body-bold' : ''}>
                        <TranslatedString id="shipping.guest_multishipping_no_shipping_address_message" />
                    </h3>
                    <a
                        className={themeV2 ? 'body-cta' : ''}
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
                        className={themeV2 ? 'body-cta' : ''}
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
