import React, { FunctionComponent, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';


import { AddressSelectProps } from './AddressSelect';
import StaticAddress from './StaticAddress';

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses' | 'type'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps & WithLanguageProps> = ({
    selectedAddress,
    language,
    type
}) => {
    const [ariaExpanded, setAriaExpanded] = useState(false);

    return (
        <a
            aria-controls="addressDropdown"
            aria-label={language.translate('address.enter_or_select_address_action')}
            aria-expanded={ariaExpanded}
            className="button dropdown-button dropdown-toggle--select"
            data-test="address-select-button"
            href="#"
            id="addressToggle"
            onBlur={() => setAriaExpanded(false)}
            onClick={preventDefault(() => setAriaExpanded(!ariaExpanded))}
        >
            {selectedAddress ? (
                <StaticAddress address={selectedAddress} type={type} />
            ) : (
                <TranslatedString id="address.enter_address_action" />
            )}
        </a>
    );
};

export default withLanguage(AddressSelectButton);
