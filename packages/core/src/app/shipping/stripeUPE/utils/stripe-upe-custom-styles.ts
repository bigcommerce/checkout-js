import '../../../../scss/components/checkout/stripeLink/_stripeIframe.scss';

export interface StripeStyles {
    [key: string]: string;
}

export const getStripeCustomStyles = (
    styles: StripeStyles | undefined | boolean,
    experiment = false,
    step = '',
) => {
    let appearance: any = {
        variables: {
            spacingUnit: getStripeSpaceUnit(experiment, step),
            borderRadius: `$global-radius`,
        },
    };

    if (styles && typeof styles !== 'boolean') {
        appearance = {
            ...appearance,
            variables: {
                ...appearance?.variables,
                colorPrimary: styles.fieldInnerShadow,
                colorBackground: styles.fieldBackground,
                colorText: styles.labelText,
                colorDanger: styles.fieldErrorText,
                colorTextSecondary: styles.labelText,
                colorTextPlaceholder: styles.fieldPlaceholderText,
                colorIcon: styles.fieldPlaceholderText,
            },
            rules: {
                '.Input': {
                    borderColor: styles.fieldBorder,
                    color: styles.fieldText,
                    boxShadow: styles.fieldInnerShadow,
                },
            },
        };
    }

    if (experiment) {
        appearance = {
            ...appearance,
            labels: 'floating',
            variables: {
                ...appearance?.variables,
                fontSizeBase: `$floating-label-font-size--default`,
            },
            rules: {
                ...appearance?.rules,
                '.Input': {
                    ...appearance?.rules?.['.Input'],
                    padding: `$stripe-padding-top $stripe-padding-right $stripe-padding-bottom $stripe-padding-left`,
                },
            },
        };
    }

    return appearance;
};

const getStripeSpaceUnit = (
    experiment: boolean,
    step: string,
) => {
    if (experiment) {
        return step === 'linkAuthentication' ? getStyle('stripe-space-unit') : getStyle('half-stripe-space-unit');
    }

    return getStyle('default-stripe-space-unit');
}

const getStyle = (style: string) => {
    return window.getComputedStyle(document.documentElement).getPropertyValue(`--${style}`).trim();
}
