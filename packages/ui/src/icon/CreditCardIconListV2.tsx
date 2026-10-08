import classNames from 'classnames';
import { difference, union } from 'lodash';
import React, { type FunctionComponent, type MouseEvent } from 'react';

import { isSmallScreen } from '../responsive';
import { Tooltip, TooltipTrigger } from '../tooltip';

import { CreditCardIcon, filterInstrumentTypes } from './';

interface CreditCardIconListV2Props {
    cardTypes: string[];
    moreCardsLabel: string;
    selectedCardType?: string;
}

const MAX_VISIBLE_CARD_TYPES = 3;
const MAX_VISIBLE_CARD_TYPES_SMALL_SCREEN = 2;

const getMaxVisibleCardTypes = () =>
    isSmallScreen() ? MAX_VISIBLE_CARD_TYPES_SMALL_SCREEN : MAX_VISIBLE_CARD_TYPES;

const CardIcon: FunctionComponent<{ type: string }> = ({ type }) => (
    <span className="cardIcon">
        <CreditCardIcon cardType={type} />
    </span>
);

const preventLabelActivation = (event: MouseEvent<HTMLElement>) => event.preventDefault();

const CardTypesOverflow: FunctionComponent<{ cardTypes: string[]; label: string }> = ({
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
                <span onClick={preventLabelActivation} role="presentation">
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
                </span>
            }
        >
            <span className="creditCardTypes-overflowCount">+{cardTypes.length}</span>
        </TooltipTrigger>
    </li>
);

export const CreditCardIconListV2: FunctionComponent<CreditCardIconListV2Props> = ({
    cardTypes,
    moreCardsLabel,
    selectedCardType,
}) => {
    const supportedCardTypes = filterInstrumentTypes(cardTypes);

    if (!supportedCardTypes.length) {
        return null;
    }

    const firstCardTypes = supportedCardTypes.slice(0, getMaxVisibleCardTypes());
    const visibleCardTypes =
        selectedCardType && supportedCardTypes.includes(selectedCardType)
            ? union(firstCardTypes, [selectedCardType])
            : firstCardTypes;
    const hiddenCardTypes = difference(supportedCardTypes, visibleCardTypes);

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
