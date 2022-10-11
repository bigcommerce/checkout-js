/* istanbul ignore file */

import React, { FunctionComponent, memo, MouseEvent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import './MultiCheckboxControl.scss';

export interface MultiCheckboxControlProps {
    testId?: string;
    onSelectedAll(): void;
    onSelectedNone(): void;
}

const MultiCheckboxControl: FunctionComponent<MultiCheckboxControlProps> = ({
    testId,
    onSelectedAll,
    onSelectedNone,
}) => {
    const handleSelectAllClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            onSelectedAll();
        },
        [onSelectedAll],
    );

    const handleSelectNoneClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            onSelectedNone();
        },
        [onSelectedNone],
    );

    return (
        <ul className="multiCheckbox--controls">
            <li className="multiCheckbox--control">
                <TranslatedString id="address.select" />
            </li>

            <li className="multiCheckbox--control">
                <a
                    data-test={`${testId || ''}Checkbox-all-button`}
                    href="#"
                    onClick={handleSelectAllClick}
                >
                    <TranslatedString id="address.select_all" />
                </a>
            </li>

            <li className="multiCheckbox--control">
                <a
                    data-test={`${testId || ''}Checkbox-none-button`}
                    href="#"
                    onClick={handleSelectNoneClick}
                >
                    <TranslatedString id="address.select_none" />
                </a>
            </li>
        </ul>
    );
};

export default memo(MultiCheckboxControl);
