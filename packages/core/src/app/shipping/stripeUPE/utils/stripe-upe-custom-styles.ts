import stripeIframe from '../../../../scss/components/checkout/stripeLink/_stripeIframe.scss';

export interface StripeStyles {
    [key: string]: string;
}

export const getStripeCustomStyles = (
    styles: StripeStyles | undefined | boolean,
    experiment = false,
    step = '',
) => {

    const getStripeSpaceUnit = (
        experiment: boolean,
        step: string,
    ) => {
        if (experiment) {
            return step === 'linkAuthentication' ? spaceUnit : spaceUnitFloating;
        }

        return spaceUnit;
    }

    const stripeDefault = {
        'border-radius': '4px',
        'font-size': '16px',
        padding: '6px 12px 3.33333px 12px',
        'padding-left': '4.3',
        'padding-right': '2.8'
    }

    const {
        'border-radius': borderRadius,
        'font-size': fontSize,
        padding,
        'padding-left': spaceUnit,
        'padding-right': spaceUnitFloating
    } = typeof stripeIframe === 'object' ? stripeIframe : stripeDefault;

    let appearance: any = {
        variables: {
            borderRadius,
            fontSizeBase: fontSize,
            spacingUnit: getStripeSpaceUnit(experiment, step)
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
            rules: {
                ...appearance?.rules,
                '.Input': {
                    ...appearance?.rules?.['.Input'],
                    padding,
                },
            },
        };
    }

    return appearance;
};
