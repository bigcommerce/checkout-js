import React, { type FunctionComponent, memo, useCallback, useRef } from 'react';

export interface SwitchProps {
    checked: boolean;
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    label?: React.ReactNode;
    id?: string;
    name?: string;
    testId?: string;
}

export const Switch: FunctionComponent<SwitchProps> = memo(
    ({ checked, onChange, label, id, name, testId }) => {
        const autoId = useRef(`bc-switch-${Math.random().toString(36).slice(2, 8)}`);
        const inputId = id ?? autoId.current;

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
                        aria-label={label ? undefined : 'switch label'}
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
                {label ? <span className="bc-switch__label">{label}</span> : null}
            </label>
        );
    },
);
