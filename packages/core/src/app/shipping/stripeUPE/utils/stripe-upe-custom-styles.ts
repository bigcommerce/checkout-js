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
            borderRadius: '4px',
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
                fontSizeBase: '14px',
            },
            rules: {
                ...appearance?.rules,
                '.Input': {
                    ...appearance?.rules?.['.Input'],
                    padding: '7px 13px 5px 13px',
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
        return step === 'linkAuthentication' ? '5px' : '2.5px';
    }

    return '4px';
}
