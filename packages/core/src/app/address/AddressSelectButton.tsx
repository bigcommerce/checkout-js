import React, { FunctionComponent, useState } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString, withLanguage, WithLanguageProps } from '../locale';

import { AddressSelectProps } from './AddressSelect';
import StaticAddress from './StaticAddress';

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps & WithLanguageProps> = ({
    selectedAddress,
    language,
}) => {
    const [ariaExpanded, setAriaExpanded] = useState(false);

    return (
        <a
            aria-controls="addressDropdown"
            aria-description={language.translate('address.enter_or_select_address_action')}
            aria-expanded={ariaExpanded}
            className="button dropdown-button dropdown-toggle--select"
            href="#"
            id="addressToggle"
            onClick={preventDefault(() => setAriaExpanded(!ariaExpanded))}
        >
            {selectedAddress ? (
                <StaticAddress address={selectedAddress} />
            ) : (
                <TranslatedString id="address.enter_address_action" />
            )}
        </a>
    );
};

export default withLanguage(AddressSelectButton);
