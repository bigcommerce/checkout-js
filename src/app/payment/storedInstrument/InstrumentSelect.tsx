import { Instrument } from '@bigcommerce/checkout-sdk';
import { expirationDate } from 'card-validator';
import classNames from 'classnames';
import creditCardType from 'credit-card-type';
import { FieldProps } from 'formik';
import { find, noop } from 'lodash';
import React, { Component, FunctionComponent, ReactNode } from 'react';

import { TranslatedString } from '../../locale';
import { DropdownTrigger } from '../../ui/dropdown';
import { CreditCardIcon } from '../creditCard';

import mapFromInstrumentCardType from './mapFromInstrumentCardType';

export interface InstrumentSelectProps extends FieldProps<string> {
    instruments: Instrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewCard(): void;
}

export interface InstrumentSelectValues {
    instrumentId: string;
}

class InstrumentSelect extends Component<InstrumentSelectProps> {
    componentDidMount() {
        this.updateFieldValue();
    }

    componentDidUpdate(prevProps: Readonly<InstrumentSelectProps>) {
        const { selectedInstrumentId: prevSelectedInstrumentId } = prevProps;
        const { selectedInstrumentId } = this.props;

        if (prevSelectedInstrumentId !== selectedInstrumentId) {
            this.updateFieldValue();
        }
    }

    render(): ReactNode {
        const {
            field,
            instruments,
            onSelectInstrument,
            onUseNewCard,
            selectedInstrumentId,
        } = this.props;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });

        return (
            <div className="instrumentSelect">
                <DropdownTrigger dropdown={
                    <InstrumentMenu
                        instruments={ instruments }
                        selectedInstrumentId={ selectedInstrumentId }
                        onSelectInstrument={ onSelectInstrument }
                        onUseNewCard={ onUseNewCard }
                    />
                }>
                    <InstrumentSelectButton
                        instrument={ selectedInstrument }
                        testId="instrument-select"
                    />

                    <input
                        type="hidden"
                        { ...field }
                    />
                </DropdownTrigger>
            </div>
        );
    }

    private updateFieldValue(): void {
        const {
            form,
            field,
            selectedInstrumentId,
        } = this.props;

        form.setFieldValue(field.name, selectedInstrumentId || '');
    }
}

interface InstrumentMenuProps {
    instruments: Instrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewCard(): void;
}

const InstrumentMenu: FunctionComponent<InstrumentMenuProps> = ({
    instruments,
    selectedInstrumentId,
    onSelectInstrument,
    onUseNewCard,
}) => (
    <ul
        className="instrumentSelect-dropdownMenu instrumentSelect-dropdownMenuNext dropdown-menu"
        data-test="instrument-select-menu"
    >
        { instruments.map(instrument => (
            <li
                className={ classNames(
                    'instrumentSelect-option dropdown-menu-item',
                    { 'instrumentSelect-option--selected': instrument.bigpayToken === selectedInstrumentId }
                ) }
                key={ instrument.bigpayToken }
            >
                <InstrumentMenuItem
                    instrument={ instrument }
                    testId="instrument-select-option"
                    onClick={ () => onSelectInstrument(instrument.bigpayToken) }
                />
            </li>
        )) }

        <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
            <InstrumentUseNewButton
                onClick={ onUseNewCard }
                testId="instrument-select-option-use-new"
            />
        </li>
    </ul>
);

interface InstrumentSelectButtonProps {
    instrument?: Instrument;
    testId?: string;
    onClick?(): void;
}

const InstrumentSelectButton: FunctionComponent<InstrumentSelectButtonProps> = ({
    instrument,
    testId,
    onClick,
}) => {
    if (!instrument) {
        return (
            <InstrumentUseNewButton
                className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
                testId={ testId }
            />
        );
    }

    return (
        <InstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={ instrument }
            testId={ testId }
            onClick={ onClick }
        />
    );
};

interface InstrumentMenuItemProps {
    className?: string;
    instrument: Instrument;
    testId?: string;
    onClick?(): void;
}

const InstrumentMenuItem: FunctionComponent<InstrumentMenuItemProps> = ({
    className,
    instrument,
    testId,
    onClick,
}) => {
    const cardType = mapFromInstrumentCardType(instrument.brand);
    const cardInfo = creditCardType.getTypeInfo(cardType);
    const isExpired = expirationDate({
        month: instrument.expiryMonth,
        year: instrument.expiryYear,
    }).isValid === false;

    return (
        <button
            type="button"
            className={ className }
            data-test={ testId }
            onClick={ onClick }
        >
            <div className={ classNames(
                'instrumentSelect-details',
                { 'instrumentSelect-details--expired': isExpired }
            ) }>
                <CreditCardIcon cardType={ cardType } />

                <div
                    className="instrumentSelect-card"
                    data-test={ `${testId}-last4` }
                >
                    { cardInfo ?
                        <TranslatedString
                            id="payment.instrument_ending_in_text"
                            data={ { cardTitle: cardInfo.niceType, endingIn: instrument.last4 } }
                        /> :
                        <TranslatedString
                            id="payment.instrument_default_ending_in_text"
                            data={ { endingIn: instrument.last4 } }
                        /> }
                </div>

                <div
                    className={ classNames(
                        'instrumentSelect-expiry',
                        { 'instrumentSelect-expiry--expired': isExpired }
                    ) }
                    data-test={ `${testId}-expiry` }
                >
                    { isExpired ?
                        <TranslatedString
                            id="payment.instrument_expired_text"
                            data={ { expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}` } }
                        /> :
                        <TranslatedString
                            id="payment.instrument_expires_text"
                            data={ { expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}` } }
                        /> }
                </div>
            </div>
        </button>
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
    <button
        className={ className }
        data-test={ testId }
        type="button"
        onClick={ onClick }
    >
        <div className="instrumentSelect-details instrumentSelect-details--addNew">
            <CreditCardIcon />

            <div className="instrumentSelect-card">
                <TranslatedString id="payment.instrument_add_card_action" />
            </div>
        </div>
    </button>
);

export default InstrumentSelect;
