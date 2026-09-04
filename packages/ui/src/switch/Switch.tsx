import React, { type FunctionComponent, memo, useCallback, useId } from 'react';

export interface SwitchProps {
    checked: boolean;
    label: React.ReactNode;
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    name?: string;
    testId?: string;
}

export const Switch: FunctionComponent<SwitchProps> = memo(
    ({ checked, onChange, label, id, name, testId }) => {
        const autoId = useId();
        const inputId = id ?? autoId;

        const handleChange = useCallback(
            (event: React.ChangeEvent<HTMLInputElement>) => {
                onChange?.(event.target.checked, event);
            },
            [onChange],
        );

        return (
            <label className="switch" data-test={testId} htmlFor={inputId}>
                <span className="switch__label">{label}</span>
                <input
                    checked={checked}
                    className="switch__input"
                    id={inputId}
                    name={name}
                    onChange={handleChange}
                    role="switch"
                    type="checkbox"
                />
                <span aria-hidden="true" className="switch__track">
                    <span className="switch__thumb" />
                </span>
            </label>
        );
    },
);
