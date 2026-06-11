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
                const next = event.target.checked;

                onChange?.(next, event);
            },
            [onChange],
        );

        return (
            <label
                className="bc-switch bc-switch--label-start"
                data-test={testId}
                htmlFor={inputId}
            >
                <span className="bc-switch__control">
                    <input
                        checked={checked}
                        className="bc-switch__input"
                        id={inputId}
                        name={name}
                        onChange={handleChange}
                        role="switch"
                        type="checkbox"
                    />
                    <span className="bc-switch__track" />
                    <span className="bc-switch__base">
                        <span className="bc-switch__thumb" />
                    </span>
                </span>
                <span className="bc-switch__label">{label}</span>
            </label>
        );
    },
);
