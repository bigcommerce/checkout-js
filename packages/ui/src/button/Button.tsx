import classNames from 'classnames';
import React, { ButtonHTMLAttributes, FunctionComponent } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isFullWidth?: boolean;
    isLoading?: boolean;
    size?: ButtonSize;
    testId?: string;
    variant?: ButtonVariant;
}

export enum ButtonVariant {
    Primary = 'primary',
    Secondary = 'secondary',
    Action = 'action',
}

export enum ButtonSize {
    Small = 'small',
    Tiny = 'tiny',
    Large = 'large',
}

function getClassName(
    props: Pick<ButtonProps, 'className' | 'isFullWidth' | 'isLoading' | 'size' | 'variant'>,
) {
    const { className, isFullWidth, isLoading, size, variant } = props;

    return classNames(
        'button',
        className,
        { 'button--primary': variant === ButtonVariant.Primary },
        { 'button--tertiary': variant === ButtonVariant.Secondary },
        { 'button--action': variant === ButtonVariant.Action },
        { 'button--small': size === ButtonSize.Small },
        { 'button--tiny': size === ButtonSize.Tiny },
        { 'button--large': size === ButtonSize.Large },
        { 'button--slab': isFullWidth },
        {
            'optimizedCheckout-buttonPrimary':
                variant === ButtonVariant.Primary || variant === ButtonVariant.Action,
        },
        { 'optimizedCheckout-buttonSecondary': variant === ButtonVariant.Secondary },
        { 'is-loading': isLoading },
    );
}

const Button: FunctionComponent<ButtonProps> = ({
    children,
    className,
    disabled,
    isFullWidth,
    isLoading,
    size,
    testId,
    type,
    variant,
    ...rest
}) => (
    <button
        {...rest}
        className={getClassName({ className, isFullWidth, isLoading, size, variant })}
        data-test={testId}
        disabled={disabled || isLoading}
        type={type || 'button'}
    >
        {children}
    </button>
);

export default Button;
