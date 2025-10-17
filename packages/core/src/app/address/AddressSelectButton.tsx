import React, { type FunctionComponent, useState } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';

import { type AddressSelectProps } from './AddressSelect';
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
    const { themeV2 } = useThemeContext();
    const [ariaExpanded, setAriaExpanded] = useState(false);

    const SelectedAddress = () => {
        if (!selectedAddress) {
            return (<span className={themeV2 ? 'body-regular' : ''} data-test="address-select-placeholder">
                {placeholderText ?? <TranslatedString id="address.enter_address_action" />}
            </span>);
        }

        return showSingleLineAddress
            ? <SingleLineStaticAddress address={selectedAddress} type={type} />
            : <StaticAddress address={selectedAddress} type={type} />;
    }

    return (
        <a
            aria-controls="addressDropdown"
            aria-expanded={ariaExpanded}
            aria-label={language.translate('address.enter_or_select_address_action')}
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
