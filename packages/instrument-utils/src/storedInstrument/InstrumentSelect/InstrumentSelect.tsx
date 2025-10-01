import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import { expirationDate } from 'card-validator';
import classNames from 'classnames';
import creditCardType from 'credit-card-type';
import { type FieldProps } from 'formik';
import { find, noop } from 'lodash';
import React, { type FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CreditCardIcon, DropdownTrigger } from '@bigcommerce/checkout/ui';

import { mapFromInstrumentCardType } from '../mapFromInstrumentCardType';

export interface InstrumentSelectProps extends FieldProps<string> {
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    shouldHideExpiryDate?: boolean;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface InstrumentSelectValues {
    instrumentId: string;
}

interface InstrumentMenuItemProps {
    className?: string;
    instrument: CardInstrument;
    testId?: string;
    shouldHideExpiryDate?: boolean;
    onClick?(): void;
}

const InstrumentMenuItem: FunctionComponent<InstrumentMenuItemProps> = ({
    className,
    instrument,
    testId,
    shouldHideExpiryDate = false,
    onClick,
}) => {
    const cardType = mapFromInstrumentCardType(instrument.brand);
    const cardInfo = creditCardType.getTypeInfo(cardType);
    const isExpired = !expirationDate({
        month: instrument.expiryMonth,
        year: instrument.expiryYear,
    }).isValid;

    return (
        <button className={className} data-test={testId} onClick={onClick} type="button">
            <div
                className={classNames('instrumentSelect-details', {
                    'instrumentSelect-details--expired': isExpired,
                })}
            >
                <CreditCardIcon cardType={cardType} />

                <div className="instrumentSelect-card" data-test={`${testId ?? ''}-last4`}>
                    {cardInfo ? (
                        <TranslatedString
                            data={{
                                cardTitle: cardInfo.niceType ?? '',
                                endingIn: instrument.last4,
                            }}
                            id="payment.instrument_ending_in_text"
                        />
                    ) : (
                        <TranslatedString
                            data={{ endingIn: instrument.last4 }}
                            id="payment.instrument_default_ending_in_text"
                        />
                    )}
                </div>

                {!shouldHideExpiryDate && (
                    <div
                        className={classNames('instrumentSelect-expiry', {
                            'instrumentSelect-expiry--expired': isExpired,
                        })}
                        data-test={`${testId || ''}-expiry`}
                    >
                        {isExpired ? (
                            <TranslatedString
                                data={{
                                    expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}`,
                                }}
                                id="payment.instrument_expired_text"
                            />
                        ) : (
                            <TranslatedString
                                data={{
                                    expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}`,
                                }}
                                id="payment.instrument_expires_text"
                            />
                        )}
                    </div>
                )}
            </div>
        </button>
    );
};

interface InstrumentOptionProps {
    instrument: CardInstrument;
    testId?: string;
    shouldHideExpiryDate?: boolean;
    onClick?(token: string): void;
}

const InstrumentOption: FunctionComponent<InstrumentOptionProps> = ({
    instrument,
    shouldHideExpiryDate = false,
    onClick = noop,
}) => {
    const handleClick = useCallback(() => {
        onClick(instrument.bigpayToken);
    }, [onClick, instrument]);

    return (
        <InstrumentMenuItem
            instrument={instrument}
            onClick={handleClick}
            shouldHideExpiryDate={shouldHideExpiryDate}
            testId="instrument-select-option"
        />
    );
};

interface InstrumentUseNewButtonProps {
    className?: string;
    testId?: string;
    onClick?(): void;
}

const InstrumentUseNewButton: FunctionComponent<InstrumentUseNewButtonProps> = ({
    className,
    testId,
    onClick = noop,
}) => (
    <button className={className} data-test={testId} onClick={onClick} type="button">
        <div className="instrumentSelect-details instrumentSelect-details--addNew">
            <CreditCardIcon />

            <div className="instrumentSelect-card">
                <TranslatedString id="payment.instrument_add_card_action" />
            </div>
        </div>
    </button>
);

interface InstrumentMenuProps {
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    shouldHideExpiryDate?: boolean;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const InstrumentMenu: FunctionComponent<InstrumentMenuProps> = ({
    instruments,
    selectedInstrumentId,
    shouldHideExpiryDate = false,
    onSelectInstrument,
    onUseNewInstrument,
}) => {
    return (
        <ul
            className="instrumentSelect-dropdownMenu instrumentSelect-dropdownMenuNext dropdown-menu"
            data-test="instrument-select-menu"
        >
            {instruments.map((instrument) => (
                <li
                    className={classNames('instrumentSelect-option dropdown-menu-item', {
                        'instrumentSelect-option--selected':
                            instrument.bigpayToken === selectedInstrumentId,
                    })}
                    key={instrument.bigpayToken}
                >
                    <InstrumentOption
                        instrument={instrument}
                        onClick={onSelectInstrument}
                        shouldHideExpiryDate={shouldHideExpiryDate}
                        testId="instrument-select-option"
                    />
                </li>
            ))}

            <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
                <InstrumentUseNewButton
                    onClick={onUseNewInstrument}
                    testId="instrument-select-option-use-new"
                />
            </li>
        </ul>
    );
};

interface InstrumentSelectButtonProps {
    instrument?: CardInstrument;
    shouldHideExpiryDate?: boolean;
    testId?: string;
    onClick?(): void;
}

const InstrumentSelectButton: FunctionComponent<InstrumentSelectButtonProps> = ({
    instrument,
    shouldHideExpiryDate = false,
    testId,
    onClick,
}) => {
    if (!instrument) {
        return (
            <InstrumentUseNewButton
                className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
                testId={testId}
            />
        );
    }

    return (
        <InstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={instrument}
            onClick={onClick}
            shouldHideExpiryDate={shouldHideExpiryDate}
            testId={testId}
        />
    );
};

const InstrumentSelect: FunctionComponent<InstrumentSelectProps> = ({
    field,
    form,
    instruments,
    onSelectInstrument,
    onUseNewInstrument,
    selectedInstrumentId,
    shouldHideExpiryDate = false,
}) => {
    const prevSelectedInstrumentIdRef = useRef(selectedInstrumentId);

    const updateFieldValue = useCallback(
        (instrumentId = '') => {
            void form.setFieldValue(field.name, instrumentId);
        },
        [form, field.name],
    );

    useEffect(() => {
        // FIXME: Used setTimeout here because setFieldValue call doesnot set value if called before formik is properly mounted.
        //        This ensures that update Field value is called after formik has mounted.
        // See GitHub issue: https://github.com/jaredpalmer/formik/issues/930
        setTimeout(() => updateFieldValue(selectedInstrumentId));

        return () => {
            if (field.value === '' && selectedInstrumentId !== undefined) {
                updateFieldValue();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (prevSelectedInstrumentIdRef.current !== selectedInstrumentId) {
            // FIXME: Used setTimeout here because setFieldValue call doesnot set value if called before formik is properly mounted.
            //        This ensures that update Field value is called after formik has mounted.
            // See GitHub issue: https://github.com/jaredpalmer/formik/issues/930
            setTimeout(() => updateFieldValue(selectedInstrumentId));
        }

        prevSelectedInstrumentIdRef.current = selectedInstrumentId;
    }, [selectedInstrumentId, updateFieldValue]);

    const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });

    return (
        <div className="instrumentSelect">
            <DropdownTrigger
                dropdown={
                    <InstrumentMenu
                        instruments={instruments}
                        onSelectInstrument={onSelectInstrument}
                        onUseNewInstrument={onUseNewInstrument}
                        selectedInstrumentId={selectedInstrumentId}
                        shouldHideExpiryDate={shouldHideExpiryDate}
                    />
                }
            >
                <InstrumentSelectButton
                    instrument={selectedInstrument}
                    shouldHideExpiryDate={shouldHideExpiryDate}
                    testId="instrument-select"
                />

                <input type="hidden" {...field} />
            </DropdownTrigger>
        </div>
    );
};

export default InstrumentSelect;
