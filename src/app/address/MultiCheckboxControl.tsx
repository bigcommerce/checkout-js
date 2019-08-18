import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../locale';

export interface MultiCheckboxControlProps {
    testId?: string;
    onSelectedAll(): void;
    onSelectedNone(): void;
}

const MultiCheckboxControl: FunctionComponent<MultiCheckboxControlProps> = ({
    testId,
    onSelectedAll,
    onSelectedNone,
}) => (
    <ul className="multiCheckbox--controls">
        <li className="multiCheckbox--control">
            <TranslatedString id="address.select" />
        </li>
        <li className="multiCheckbox--control">
            <a
                data-test={ `${testId}Checkbox-all-button` }
                href="#"
                onClick={ e => {
                    e.preventDefault();
                    onSelectedAll();
                }
            }>
                <TranslatedString id="address.select_all" />
            </a>
        </li>

        <li className="multiCheckbox--control">
            <a
                data-test={ `${testId}Checkbox-none-button` }
                href="#"
                onClick={ e => {
                    e.preventDefault();
                    onSelectedNone();
                }
            }>
                <TranslatedString id="address.select_none" />
            </a>
        </li>
    </ul>
);

export default MultiCheckboxControl;
