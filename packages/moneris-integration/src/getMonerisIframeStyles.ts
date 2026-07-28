import { kebabCase } from 'lodash';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { getCreditCardInputStyles } from '@bigcommerce/checkout/instrument-utils';

export interface MonerisIframeStyles {
    cssBody?: string;
    cssTextbox?: string;
    cssTextboxCardNumber?: string;
    cssTextboxExpiryDate?: string;
    cssTextboxCVV?: string;
    cssInputLabel?: string;
}

export interface GetMonerisIframeStylesOptions {
    cardCodeContainerId?: string;
    cardExpiryContainerId: string;
    cardNumberContainerId: string;
}

const INPUT_STYLE_PROPERTIES = [
    'backgroundColor',
    'border',
    'borderColor',
    'borderRadius',
    'borderStyle',
    'borderWidth',
    'boxSizing',
    'color',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'height',
    'outline',
    'padding',
];

const LABEL_STYLE_PROPERTIES = ['color', 'fontFamily', 'fontSize', 'fontWeight'];

function toCssString(styles: Record<string, string>, properties: string[]): string {
    return properties
        .map((property) => {
            const value = styles[property];

            if (!value) {
                return '';
            }

            return `${kebabCase(property)}: ${value};`;
        })
        .join('');
}

function getLabelStyles(containerId: string): Record<string, string> {
    const container = document.getElementById(containerId);

    if (!container) {
        return {};
    }

    const field = document.createElement('div');
    const label = document.createElement('label');

    field.className = 'form-field form-field--ccNumber';
    label.className = 'form-label';
    field.appendChild(label);
    container.appendChild(field);

    const styles = getAppliedStyles(label, LABEL_STYLE_PROPERTIES);

    container.removeChild(field);

    return styles;
}

export default async function getMonerisIframeStyles({
    cardCodeContainerId,
    cardExpiryContainerId,
    cardNumberContainerId,
}: GetMonerisIframeStylesOptions): Promise<MonerisIframeStyles> {
    const defaultInputStyles = await getCreditCardInputStyles(
        cardNumberContainerId,
        INPUT_STYLE_PROPERTIES,
    );

    const cssTextbox = toCssString(
        {
            ...defaultInputStyles,
            outline: defaultInputStyles.outline || '0',
            width: '100%',
        },
        [...INPUT_STYLE_PROPERTIES, 'outline', 'width'],
    );

    const cssBody = toCssString(defaultInputStyles, ['fontFamily']);

    const expiryStyles = await getCreditCardInputStyles(cardExpiryContainerId, [
        'width',
        ...INPUT_STYLE_PROPERTIES,
    ]);

    const cssTextboxExpiryDate = expiryStyles.width
        ? `width: ${expiryStyles.width};`
        : 'margin-bottom: 0;width: calc(50% - 12px);';

    let cssTextboxCVV = 'margin-bottom: 0;width: calc(50% - 12px);';

    if (cardCodeContainerId) {
        const cvvStyles = await getCreditCardInputStyles(cardCodeContainerId, ['width']);

        if (cvvStyles.width) {
            cssTextboxCVV = `width: ${cvvStyles.width};`;
        }
    }

    const labelStyles = getLabelStyles(cardNumberContainerId);
    const cssInputLabel = toCssString(labelStyles, LABEL_STYLE_PROPERTIES);

    console.log({
        cssBody: cssBody ? `${cssBody}background: transparent;` : undefined,
        cssTextbox: cssTextbox || undefined,
        cssTextboxCardNumber: 'width: 100%;',
        cssTextboxExpiryDate,
        cssTextboxCVV,
        cssInputLabel: cssInputLabel || undefined,
    });

    return {
        cssBody: cssBody ? `${cssBody}background: transparent;` : undefined,
        cssTextbox: cssTextbox || undefined,
        cssTextboxCardNumber: 'width: 100%;',
        cssTextboxExpiryDate,
        cssTextboxCVV,
        cssInputLabel: cssInputLabel || undefined,
    };
}
