/* istanbul ignore file */

import classNames from 'classnames';
import React, { type FunctionComponent, memo, type MouseEvent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import './MultiCheckboxControl.scss';

export interface MultiCheckboxControlProps {
    testId?: string;
    themeV2?: boolean;
    onSelectedAll(): void;
    onSelectedNone(): void;
}

const MultiCheckboxControl: FunctionComponent<MultiCheckboxControlProps> = ({
    testId,
    onSelectedAll,
    onSelectedNone,
    themeV2 = false,
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
        <ul className={classNames('multiCheckbox--controls', { 'body-regular': themeV2 })}>
            <li className="multiCheckbox--control">
                <TranslatedString id="address.select" />
            </li>

            <li className="multiCheckbox--control">
                <a
                    data-test={`${testId}Checkbox-all-button`}
                    href="#"
                    onClick={handleSelectAllClick}
                >
                    <TranslatedString id="address.select_all" />
                </a>
            </li>

            <li className="multiCheckbox--control">
                <a
                    data-test={`${testId}Checkbox-none-button`}
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
