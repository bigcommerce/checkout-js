import classNames from 'classnames';
import { difference, intersection, union } from 'lodash';
import React, { type FunctionComponent, memo } from 'react';

import { Tooltip, TooltipTrigger } from '../tooltip';

import { CreditCardIcon, filterInstrumentTypes } from './';

export interface CreditCardIconListProps {
    selectedCardType?: string;
    cardTypes: string[];
    priorityCardTypes?: string[];
    moreCardsLabel?: string;
}

const CardIcon: FunctionComponent<{ type: string }> = ({ type }) => (
    <span className="cardIcon">
        <CreditCardIcon cardType={type} />
    </span>
);

const CardTypesOverflow: FunctionComponent<{ cardTypes: string[]; label?: string }> = ({
    cardTypes,
    label,
}) => (
    <li
        className="creditCardTypes-list-item creditCardTypes-list-item--overflow"
        data-test="credit-card-overflow"
    >
        <TooltipTrigger
            ariaLabel={label}
            placement="top-end"
            strategy="fixed"
            tooltip={
                <Tooltip testId="credit-card-overflow-tooltip">
                    <ul className="creditCardTypes-overflowList">
                        {cardTypes.map((type) => (
                            <li
                                className="creditCardTypes-overflowList-item"
                                data-test={`${type}-overflow-icon`}
                                key={type}
                            >
                                <CardIcon type={type} />
                            </li>
                        ))}
                    </ul>
                </Tooltip>
            }
        >
            <span className="creditCardTypes-overflowCount">+{cardTypes.length}</span>
        </TooltipTrigger>
    </li>
);

const getVisibleCardTypes = (
    cardTypes: string[],
    priorityCardTypes: string[],
    selectedCardType?: string,
): string[] => {
    const preferred = union(intersection(priorityCardTypes, cardTypes), cardTypes).slice(
        0,
        priorityCardTypes.length,
    );

    return selectedCardType && cardTypes.includes(selectedCardType)
        ? union(preferred, [selectedCardType])
        : preferred;
};

const CreditCardIconList: FunctionComponent<CreditCardIconListProps> = ({
    selectedCardType,
    cardTypes,
    priorityCardTypes,
    moreCardsLabel,
}) => {
    const filteredCardTypes = filterInstrumentTypes(cardTypes);

    if (!filteredCardTypes.length) {
        return null;
    }

    const visibleCardTypes = priorityCardTypes
        ? getVisibleCardTypes(filteredCardTypes, priorityCardTypes, selectedCardType)
        : filteredCardTypes;
    const hiddenCardTypes = difference(filteredCardTypes, visibleCardTypes);

    return (
        <ul className="creditCardTypes-list">
            {visibleCardTypes.map((type) => (
                <li
                    className={classNames(
                        'creditCardTypes-list-item',
                        { 'is-active': selectedCardType === type },
                        { 'not-active': selectedCardType && selectedCardType !== type },
                    )}
                    data-test={`${type}-icon`}
                    key={type}
                >
                    <CardIcon type={type} />
                </li>
            ))}

            {hiddenCardTypes.length > 0 && (
                <CardTypesOverflow cardTypes={hiddenCardTypes} label={moreCardsLabel} />
            )}
        </ul>
    );
};

export default memo(CreditCardIconList);
