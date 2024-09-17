import classNames from 'classnames';
import React, { FunctionComponent, memo } from 'react';

import CreditCardIcon from './CreditCardIcon';
import { filterInstrumentTypes } from './mapFromPaymentMethodCardType';

export interface CreditCardIconListProps {
    selectedCardType?: string;
    cardTypes: string[];
}

const CreditCardIconList: FunctionComponent<CreditCardIconListProps> = ({
    selectedCardType,
    cardTypes,
}) => {
    const filteredCardTypes = filterInstrumentTypes(cardTypes);

    if (!filteredCardTypes.length) {
        return null;
    }

    return (
        <ul className="creditCardTypes-list">
            {filteredCardTypes.map((type) => (
                <li
                    className={classNames(
                        'creditCardTypes-list-item',
                        { 'is-active': selectedCardType === type },
                        { 'not-active': selectedCardType && selectedCardType !== type },
                    )}
                    data-test={`${type}-icon`}
                    key={type}
                >
                    <span className="cardIcon">
                        <CreditCardIcon cardType={type} />
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default memo(CreditCardIconList);
