import React, { FunctionComponent } from 'react';

import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';

import { AddressSelectProps } from './AddressSelect';
import StaticAddress from './StaticAddress';

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps & WithLanguageProps> = ({
    selectedAddress,
    language,
}) => (
    <a
        aria-description={ language.translate('address.enter_or_select_address_action') }
        className="button dropdown-button dropdown-toggle--select"
        href="#"
        id="addressToggle"
        onClick={ preventDefault() }
    >
        { selectedAddress ?
            <StaticAddress address={ selectedAddress } /> :
            <TranslatedString id="address.enter_address_action" /> }
    </a>
);

export default withLanguage(AddressSelectButton);
