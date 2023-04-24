import { AccountInstrument, BankInstrument } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconPaypal, IconSize } from '../../ui/icon';
import { LoadingOverlay } from '../../ui/loading';

import isBankAccountInstrument from './isBankAccountInstrument';

export interface ManageAccountInstrumentsTableProps {
    instruments: Array<AccountInstrument | BankInstrument>;
    isDeletingInstrument: boolean;
    onDeleteInstrument(id: string): void;
}

const ManageInstrumentsTable: FunctionComponent<ManageAccountInstrumentsTableProps> = ({
    instruments,
    isDeletingInstrument,
    onDeleteInstrument,
}) => {
    if (instruments.length === 0) {
        return (
            <p>
                <TranslatedString id="payment.instrument_manage_modal_empty_text" />
            </p>
        );
    }

    return (
        <LoadingOverlay isLoading={isDeletingInstrument}>
            <table className="table">
                <thead className="table-thead">
                    <tr>
                        <th>
                            <TranslatedString id="payment.instrument_manage_table_header_payment_method_text" />
                        </th>
                        <th />
                    </tr>
                </thead>

                <tbody className="table-tbody">
                    {instruments.map((instrument) => (
                        <ManageInstrumentsRow
                            instrument={instrument}
                            key={instrument.bigpayToken}
                            onDeleteInstrument={onDeleteInstrument}
                        />
                    ))}
                </tbody>
            </table>
        </LoadingOverlay>
    );
};

interface ManageInstrumentsRowProps {
    instrument: AccountInstrument;
    onDeleteInstrument(id: string): void;
}

const ManageInstrumentsRow: FunctionComponent<ManageInstrumentsRowProps> = ({
    instrument,
    onDeleteInstrument,
}) => {
    const handleDelete = useCallback(() => {
        onDeleteInstrument(instrument.bigpayToken);
    }, [instrument, onDeleteInstrument]);

    return (
        <tr>
            <td data-test="manage-instrument-accountExternalId">
                {isBankAccountInstrument(instrument) ? (
                    <span className="instrumentModal-instrumentAccountNumber">
                        <TranslatedString id="payment.instrument_manage_table_header_ending_in_text" />
                        <span>{` ${instrument.accountNumber}`}</span>
                    </span>
                ) : (
                    <>
                        <IconPaypal additionalClassName="accountIcon-icon" size={IconSize.Medium} />
                        <span className="instrumentModal-instrumentAccountExternalId">
                            {instrument.externalId}
                        </span>
                    </>
                )}
            </td>
            <td>
                <button
                    className="button button--tiny table-actionButton optimizedCheckout-buttonSecondary"
                    data-test="manage-instrument-delete-button"
                    onClick={handleDelete}
                    type="button"
                >
                    <TranslatedString id="common.delete_action" />
                </button>
            </td>
        </tr>
    );
};

export default memo(ManageInstrumentsTable);
