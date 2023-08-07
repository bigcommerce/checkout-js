import React, { FunctionComponent, useState } from 'react';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { preventDefault } from '../../common/dom';

import { PayPalAxoAddressSelectProps } from './PayPalAxoAddressSelect';
import PayPalAxoStaticAddress from './PayPalAxoStaticAddress';

type AddressSelectButtonProps = Pick<PayPalAxoAddressSelectProps, 'selectedAddress' | 'addresses'>;

const PayPalAxoAddressSelectButton: FunctionComponent<AddressSelectButtonProps & WithLanguageProps> = ({
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
                <PayPalAxoStaticAddress address={selectedAddress} />
            ) : (
                <TranslatedString id="address.enter_address_action" />
            )}
        </a>
    );
};

export default withLanguage(PayPalAxoAddressSelectButton);
