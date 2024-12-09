import React, { FunctionComponent, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';


import { AddressSelectProps } from './AddressSelect';
import SingleLineStaticAddress from './SingleLineStaticAddress';
import StaticAddress from './StaticAddress';

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses' | 'type' | 'showSingleLineAddress' | 'placeholderText'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps & WithLanguageProps> = ({
    selectedAddress,
    language,
    type,
    showSingleLineAddress,
    placeholderText,
}) => {
    const [ariaExpanded, setAriaExpanded] = useState(false);

    const SelectedAddress = () => {
        if (!selectedAddress) {
            return placeholderText ?? <TranslatedString id="address.enter_address_action" />;
        }

        return showSingleLineAddress
            ? <SingleLineStaticAddress address={selectedAddress} type={type} />
            : <StaticAddress address={selectedAddress} type={type} />;
    }

    return (
        <a
            aria-controls="addressDropdown"
            aria-describedby={language.translate('address.enter_or_select_address_action')}
            aria-expanded={ariaExpanded}
            className="button dropdown-button dropdown-toggle--select"
            data-test="address-select-button"
            href="#"
            id="addressToggle"
            onBlur={() => setAriaExpanded(false)}
            onClick={preventDefault(() => setAriaExpanded(!ariaExpanded))}
        >
            <SelectedAddress />
        </a>
    );
};

export default withLanguage(AddressSelectButton);
