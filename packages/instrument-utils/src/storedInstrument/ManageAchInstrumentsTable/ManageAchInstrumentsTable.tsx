import { AchInstrument } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconAch, IconSize, LoadingOverlay } from '@bigcommerce/checkout/ui';

interface ManageInstrumentsRowProps {
    instrument: AchInstrument;
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
            <td data-test="manage-instrument-bankType">
                <IconAch size={IconSize.Medium} />
            </td>
            <td data-test="manage-instrument-accountNumber">{instrument.accountNumber}</td>
            <td data-test="manage-instrument-issuer">{instrument.issuer}</td>
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

export interface ManageAchInstrumentsTableProps {
    instruments: AchInstrument[];
    isDeletingInstrument: boolean;
    onDeleteInstrument(id: string): void;
}

const ManageAchInstrumentsTable: FunctionComponent<ManageAchInstrumentsTableProps> = ({
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
            <table className="table" data-test="manage-ach-instruments-table">
                <thead className="table-thead">
                    <tr>
                        <th>
                            <TranslatedString id="payment.instrument_manage_table_header_payment_method_text" />
                        </th>
                        <th>
                            <TranslatedString id="payment.instrument_manage_table_header_ending_in_text" />
                        </th>
                        <th>
                            <TranslatedString id="payment.instrument_manage_table_header_routing_number_text" />
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

export default ManageAchInstrumentsTable;
