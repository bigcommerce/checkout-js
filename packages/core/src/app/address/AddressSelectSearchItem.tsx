import React, { type ChangeEvent, type FunctionComponent } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TextInput } from '@bigcommerce/checkout/ui';

interface AddressSelectSearchItemProps {
    searchQuery: string;
    onSearchChange(event: ChangeEvent<HTMLInputElement>): void;
}

export const AddressSelectSearchItem: FunctionComponent<AddressSelectSearchItemProps> = ({
    onSearchChange,
    searchQuery,
}) => {
    const { language } = useLocale();

    return (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li
            className="dropdown-menu-item"
            data-test="address-select-search"
            onClick={(e) => e.stopPropagation()}
        >
            <TextInput
                aria-label={language.translate('address.search_addresses')}
                data-test="address-select-search-input"
                name="searchAddresses"
                onChange={onSearchChange}
                placeholder={language.translate('address.search_addresses')}
                type="text"
                value={searchQuery}
            />
        </li>
    );
};
