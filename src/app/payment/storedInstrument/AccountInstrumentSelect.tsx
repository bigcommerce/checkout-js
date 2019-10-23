import { AccountInstrument } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { FieldProps } from 'formik';
import { find, noop } from 'lodash';
import React, { useCallback, FunctionComponent, PureComponent, ReactNode } from 'react';

import { TranslatedString } from '../../locale';
import { DropdownTrigger } from '../../ui/dropdown';
import { IconNewAccount, IconPaypal, IconSize } from '../../ui/icon';

export interface AccountInstrumentSelectProps extends FieldProps<string> {
    instruments: AccountInstrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

export interface AccountInstrumentSelectValues {
    instrumentId: string;
}

class AccountInstrumentSelect extends PureComponent<AccountInstrumentSelectProps> {
    componentDidMount() {
        this.updateFieldValue();
    }

    componentDidUpdate(prevProps: Readonly<AccountInstrumentSelectProps>) {
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
                        <AccountInstrumentMenu
                            instruments={ instruments }
                            onSelectInstrument={ onSelectInstrument }
                            onUseNewInstrument={ onUseNewInstrument }
                            selectedInstrumentId={ selectedInstrumentId }
                        />
                    }
                >
                    <AccountInstrumentSelectButton
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

interface AccountInstrumentMenuProps {
    instruments: AccountInstrument[];
    selectedInstrumentId?: string;
    onSelectInstrument(id: string): void;
    onUseNewInstrument(): void;
}

const AccountInstrumentMenu: FunctionComponent<AccountInstrumentMenuProps> = ({
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
                <AccountInstrumentOption
                    instrument={ instrument }
                    onClick={ onSelectInstrument }
                    testId="instrument-select-option"
                />
            </li>
        )) }

        <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
            <AccountInstrumentUseNewButton
                onClick={ onUseNewInstrument }
                testId="instrument-select-option-use-new"
            />
        </li>
    </ul>;
};

interface AccountInstrumentSelectButtonProps {
    instrument?: AccountInstrument;
    testId?: string;
    onClick?(): void;
}

const AccountInstrumentSelectButton: FunctionComponent<AccountInstrumentSelectButtonProps> = ({
    instrument,
    testId,
    onClick,
}) => {
    if (!instrument) {
        return (
            <AccountInstrumentUseNewButton
                className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
                testId={ testId }
            />
        );
    }

    return (
        <AccountInstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={ instrument }
            onClick={ onClick }
            testId={ testId }
        />
    );
};

interface AccountInstrumentOptionProps {
    instrument: AccountInstrument;
    testId?: string;
    onClick?(token: string): void;
}

const AccountInstrumentOption: FunctionComponent<AccountInstrumentOptionProps> = ({
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
        <AccountInstrumentMenuItem
            instrument={ instrument }
            onClick={ handleClick }
            testId="instrument-select-option"
        />
    );
};

interface AccountInstrumentMenuItemProps {
    className?: string;
    instrument: AccountInstrument;
    testId?: string;
    onClick?(): void;
}

const AccountInstrumentMenuItem: FunctionComponent<AccountInstrumentMenuItemProps> = ({
    className,
    instrument: { externalId },
    testId,
    onClick,
}) => {
    return (
        <button
            className={ className }
            data-test={ testId }
            onClick={ onClick }
            type="button"
        >
            <div className="instrumentSelect-details">
                {
                    // TODO: When we include new account instrument types we can
                    // abstract these icons in a similar way we did for credit cards.
                }
                <IconPaypal
                    additionalClassName="accountIcon-icon"
                    size={ IconSize.Medium }
                />

                <div
                    className="instrumentSelect-account"
                    data-test={ `${testId}-externalId` }
                >
                    { externalId }
                </div>
            </div>
        </button>
    );
};

interface AccountInstrumentUseNewButtonProps {
    className?: string;
    testId?: string;
    onClick?(): void;
}

const AccountInstrumentUseNewButton: FunctionComponent<AccountInstrumentUseNewButtonProps> = ({
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
            <IconNewAccount
                additionalClassName="accountIcon-icon"
                size={ IconSize.Medium }
            />

            <div className="instrumentSelect-account">
                <TranslatedString id="payment.account_instrument_add_action" />
            </div>
        </div>
    </button>
);

export default AccountInstrumentSelect;
