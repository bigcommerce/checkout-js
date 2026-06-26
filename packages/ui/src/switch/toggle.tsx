import React, { type FunctionComponent, memo, useCallback, useId } from 'react';

export interface ToggleSwitchProps {
    checked: boolean;
    label: React.ReactNode;
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    name?: string;
    testId?: string;
}

export const ToggleSwitch: FunctionComponent<ToggleSwitchProps> = memo(
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
            <label className="bc-toggle" data-test={testId} htmlFor={inputId}>
                <span className="bc-toggle__label">{label}</span>
                <input
                    checked={checked}
                    className="bc-toggle__input"
                    id={inputId}
                    name={name}
                    onChange={handleChange}
                    role="switch"
                    type="checkbox"
                />
                <span aria-hidden="true" className="bc-toggle__track">
                    <span className="bc-toggle__thumb" />
                </span>
            </label>
        );
    },
);
