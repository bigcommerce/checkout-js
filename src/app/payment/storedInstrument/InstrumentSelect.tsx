import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { expirationDate } from 'card-validator';
import classNames from 'classnames';
import creditCardType from 'credit-card-type';
import { FieldProps } from 'formik';
import { find, noop } from 'lodash';
import React, { useCallback, FunctionComponent, PureComponent, ReactNode } from 'react';

import { TranslatedString } from '../../locale';
import { DropdownTrigger } from '../../ui/dropdown';
import { CreditCardIcon } from '../creditCard';

import mapFromInstrumentCardType from './mapFromInstrumentCardType';

export interface InstrumentSelectProps extends FieldProps<string> {
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface InstrumentSelectValues {
    instrumentId: string;
}

class InstrumentSelect extends PureComponent<InstrumentSelectProps> {
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
            onUseNewInstrument,
            selectedInstrumentId,
        } = this.props;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });

        return (
            <div className="instrumentSelect">
                <DropdownTrigger
                    dropdown={
                        <InstrumentMenu
                            instruments={ instruments }
                            onSelectInstrument={ onSelectInstrument }
                            onUseNewInstrument={ onUseNewInstrument }
                            selectedInstrumentId={ selectedInstrumentId }
                        />
                    }
                >
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
    instruments: CardInstrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const InstrumentMenu: FunctionComponent<InstrumentMenuProps> = ({
    instruments,
    selectedInstrumentId,
    onSelectInstrument,
    onUseNewInstrument,
}) => {
    return <ul
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
                <InstrumentOption
                    instrument={ instrument }
                    onClick={ onSelectInstrument }
                    testId="instrument-select-option"
                />
            </li>
        )) }

        <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
            <InstrumentUseNewButton
                onClick={ onUseNewInstrument }
                testId="instrument-select-option-use-new"
            />
        </li>
    </ul>;
};

interface InstrumentSelectButtonProps {
    instrument?: CardInstrument;
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
            onClick={ onClick }
            testId={ testId }
        />
    );
};

interface InstrumentOptionProps {
    instrument: CardInstrument;
    testId?: string;
    onClick?(token: string): void;
}

const InstrumentOption: FunctionComponent<InstrumentOptionProps> = ({
    instrument,
    onClick = noop,
}) => {
    const handleClick = useCallback(() => {
        onClick(instrument.bigpayToken);
    }, [
        onClick,
        instrument,
    ]);

    return (
        <InstrumentMenuItem
            instrument={ instrument }
            onClick={ handleClick }
            testId="instrument-select-option"
        />
    );
};

interface InstrumentMenuItemProps {
    className?: string;
    instrument: CardInstrument;
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
            className={ className }
            data-test={ testId }
            onClick={ onClick }
            type="button"
        >
            <div className={ classNames(
                'instrumentSelect-details',
                { 'instrumentSelect-details--expired': isExpired }
            ) }
            >
                <CreditCardIcon cardType={ cardType } />

                <div
                    className="instrumentSelect-card"
                    data-test={ `${testId}-last4` }
                >
                    { cardInfo ?
                        <TranslatedString
                            data={ { cardTitle: cardInfo.niceType, endingIn: instrument.last4 } }
                            id="payment.instrument_ending_in_text"
                        /> :
                        <TranslatedString
                            data={ { endingIn: instrument.last4 } }
                            id="payment.instrument_default_ending_in_text"
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
                            data={ { expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}` } }
                            id="payment.instrument_expired_text"
                        /> :
                        <TranslatedString
                            data={ { expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}` } }
                            id="payment.instrument_expires_text"
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
        onClick={ onClick }
        type="button"
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
