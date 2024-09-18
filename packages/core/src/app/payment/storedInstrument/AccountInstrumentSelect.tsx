import { AccountInstrument, AchInstrument, BankInstrument, PayPalInstrument } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { FieldProps } from 'formik';
import { find, noop } from 'lodash';
import React, { FunctionComponent, PureComponent, ReactNode, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { DropdownTrigger } from '../../ui/dropdown';
import { IconNewAccount, IconPaypal, IconSize } from '../../ui/icon';

import isBankAccountInstrument from './isBankAccountInstrument';

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
        const { selectedInstrumentId } = this.props;

        // FIXME: Used setTimeout here because setFieldValue call doesnot set value if called before formik is properly mounted.
        //        This ensures that update Field value is called after formik has mounted.
        // See GitHub issue: https://github.com/jaredpalmer/formik/issues/930
        setTimeout(() => this.updateFieldValue(selectedInstrumentId));
    }

    componentDidUpdate(prevProps: Readonly<AccountInstrumentSelectProps>) {
        const { selectedInstrumentId: prevSelectedInstrumentId } = prevProps;
        const { selectedInstrumentId } = this.props;

        if (prevSelectedInstrumentId !== selectedInstrumentId) {
            this.updateFieldValue(selectedInstrumentId);
        }
    }

    componentWillUnmount() {
        const { selectedInstrumentId, field } = this.props;

        if (field.value === '' && selectedInstrumentId !== undefined) {
            this.updateFieldValue();
        }
    }

    render(): ReactNode {
        const { field, instruments, onSelectInstrument, onUseNewInstrument, selectedInstrumentId } =
            this.props;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const { value, ...otherFieldProps } = field;

        return (
            <div className="instrumentSelect">
                <DropdownTrigger
                    dropdown={
                        <AccountInstrumentMenu
                            instruments={instruments}
                            onSelectInstrument={onSelectInstrument}
                            onUseNewInstrument={onUseNewInstrument}
                            selectedInstrumentId={selectedInstrumentId}
                        />
                    }
                >
                    <AccountInstrumentSelectButton
                        instrument={selectedInstrument}
                        testId="instrument-select"
                    />

                    <input type="hidden" value={value || ''} {...otherFieldProps} />
                </DropdownTrigger>
            </div>
        );
    }

    private updateFieldValue(instrumentId = ''): void {
        const { form, field } = this.props;

        form.setFieldValue(field.name, instrumentId);
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
                    <AccountInstrumentOption
                        instrument={instrument}
                        onClick={onSelectInstrument}
                        testId="instrument-select-option"
                    />
                </li>
            ))}

            <li className="instrumentSelect-option instrumentSelect-option--addNew dropdown-menu-item">
                <AccountInstrumentUseNewButton
                    onClick={onUseNewInstrument}
                    testId="instrument-select-option-use-new"
                />
            </li>
        </ul>
    );
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
                testId={testId}
            />
        );
    }

    return !isBankAccountInstrument(instrument) ? (
        <AccountInstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={instrument}
            onClick={onClick}
            testId={testId}
        />
    ) : (
        <BankInstrumentMenuItem
            className="instrumentSelect-button optimizedCheckout-form-select dropdown-button form-input"
            instrument={instrument}
            onClick={onClick}
            testId={testId}
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
    }, [onClick, instrument]);

    return !isBankAccountInstrument(instrument) ? (
        <AccountInstrumentMenuItem
            instrument={instrument}
            onClick={handleClick}
            testId="instrument-select-option"
        />
    ) : (
        <BankInstrumentMenuItem
            instrument={instrument}
            onClick={handleClick}
            testId="instrument-select-option"
        />
    );
};

interface AccountInstrumentMenuItemProps {
    className?: string;
    instrument: PayPalInstrument;
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
        <button className={className} data-test={testId} onClick={onClick} type="button">
            <div className="instrumentSelect-details">
                {
                    // TODO: When we include new account instrument types we can
                    // abstract these icons in a similar way we did for credit cards.
                }
                <IconPaypal additionalClassName="accountIcon-icon" size={IconSize.Medium} />

                <div className="instrumentSelect-account" data-test={`${testId}-externalId`}>
                    {externalId}
                </div>
            </div>
        </button>
    );
};

interface BankInstrumentMenuItemProps {
    className?: string;
    instrument: BankInstrument | AchInstrument;
    testId?: string;
    onClick?(): void;
}

const BankInstrumentMenuItem: FunctionComponent<BankInstrumentMenuItemProps> = ({
    className,
    instrument,
    testId,
    onClick,
}) => {
    return (
        <button className={className} data-test={testId} onClick={onClick} type="button">
            <div className="instrumentSelect-details">
                {
                    // TODO: When we include new account instrument types we can
                    // abstract these icons in a similar way we did for credit cards.
                }
                <div className="instrumentSelect-card">
                    <TranslatedString
                        data={{ accountNumber: instrument.accountNumber }}
                        id="payment.instrument_account_number_ending"
                    />
                </div>
                <div className="instrumentSelect-issuer">
                    <TranslatedString id="payment.instrument_issuer" />: {instrument.issuer}
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
    <button className={className} data-test={testId} onClick={onClick} type="button">
        <div className="instrumentSelect-details instrumentSelect-details--addNew">
            <IconNewAccount additionalClassName="accountIcon-icon" size={IconSize.Medium} />

            <div className="instrumentSelect-account">
                <TranslatedString id="payment.account_instrument_add_action" />
            </div>
        </div>
    </button>
);

export default AccountInstrumentSelect;
