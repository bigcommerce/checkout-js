import { kebabCase } from 'lodash';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

export interface MonerisIframeStyles {
    cssBody?: string;
    cssTextbox?: string;
    cssTextboxCardNumber?: string;
    cssTextboxExpiryDate?: string;
    cssTextboxCVV?: string;
    cssInputLabel?: string;
    cssLabelCardNumber?: string;
    cssLabelExpiryDate?: string;
    cssLabelCVV?: string;
}

export interface GetMonerisIframeStylesOptions {
    cardNumberContainerId: string;
}

const INPUT_STYLE_PROPERTIES = [
    'backgroundColor',
    'border',
    'borderColor',
    'borderRadius',
    'borderStyle',
    'borderWidth',
    'color',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'height',
    'outline',
];

const LABEL_STYLE_PROPERTIES = ['color', 'fontFamily', 'fontWeight'];

const CSS_BODY_LAYOUT =
    'margin: 0; padding: 24px 0; box-sizing: border-box; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; row-gap: 24px; column-gap: 8px;';

const CSS_INPUT_LABEL_LAYOUT =
    'justify-self: start; align-self: start; font-size: 0.75rem; line-height: 1; pointer-events: none; z-index: 1; transform: translateY(-100%);';

const CSS_TEXTBOX_LAYOUT =
    'justify-self: stretch; align-self: stretch; width: 100%; box-sizing: border-box;';

const CSS_GRID_PLACEMENT = {
    cardNumberLabel: 'grid-column: 1 / 3; grid-row: 1;',
    cardNumberInput: 'grid-column: 1 / 3; grid-row: 1;',
    expiryDateLabel: 'grid-column: 1; grid-row: 2;',
    expiryDateInput: 'grid-column: 1; grid-row: 2;',
    cvvLabel: 'grid-column: 2; grid-row: 2;',
    cvvInput: 'grid-column: 2; grid-row: 2;',
} as const;

function getStylesFromElement(element: HTMLElement, properties: string[]): Record<string, string> {
    return getAppliedStyles(element, properties);
}

function getStylesFromContainer(
    containerId: string,
    properties: string[],
    className = 'form-input optimizedCheckout-form-input',
): Record<string, string> {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(
            'Unable to retrieve input styles as the provided container ID is not valid.',
        );
    }

    const probe = document.createElement('div');

    probe.className = className;
    container.appendChild(probe);

    const styles = getStylesFromElement(probe, properties);

    container.removeChild(probe);

    return styles;
}

function getLabelStyles(containerId: string): Record<string, string> {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(
            'Unable to retrieve input styles as the provided container ID is not valid.',
        );
    }

    const field = document.createElement('div');
    const label = document.createElement('label');

    field.className = 'form-field form-field--ccNumber';
    label.className = 'form-label optimizedCheckout-form-label';
    field.appendChild(label);
    container.appendChild(field);

    const styles = getStylesFromElement(label, LABEL_STYLE_PROPERTIES);

    container.removeChild(field);

    return styles;
}

function sanitizeLabelStyles(styles: Record<string, string>): Record<string, string> {
    const sanitizedStyles = { ...styles };

    if (sanitizedStyles.fontFamily) {
        sanitizedStyles.fontFamily = sanitizedStyles.fontFamily.replace(/"/g, '');
    }

    return sanitizedStyles;
}

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

export default function getMonerisIframeStyles({
    cardNumberContainerId,
}: GetMonerisIframeStylesOptions): MonerisIframeStyles {
    const inputStyles = getStylesFromContainer(cardNumberContainerId, INPUT_STYLE_PROPERTIES);

    const cssTextbox = `${CSS_TEXTBOX_LAYOUT}${toCssString(
        {
            ...inputStyles,
            outline: inputStyles.outline || '0',
        },
        INPUT_STYLE_PROPERTIES.concat('outline'),
    )}`;

    const cssBody = `${CSS_BODY_LAYOUT}${toCssString(inputStyles, ['fontFamily'])}background: transparent;`;

    const labelStyles = sanitizeLabelStyles(getLabelStyles(cardNumberContainerId));
    const cssInputLabel = `${CSS_INPUT_LABEL_LAYOUT}${toCssString(labelStyles, LABEL_STYLE_PROPERTIES)}`;

    return {
        cssBody,
        cssTextbox,
        cssTextboxCardNumber: CSS_GRID_PLACEMENT.cardNumberInput,
        cssTextboxExpiryDate: CSS_GRID_PLACEMENT.expiryDateInput,
        cssTextboxCVV: CSS_GRID_PLACEMENT.cvvInput,
        cssInputLabel,
        cssLabelCardNumber: CSS_GRID_PLACEMENT.cardNumberLabel,
        cssLabelExpiryDate: CSS_GRID_PLACEMENT.expiryDateLabel,
        cssLabelCVV: CSS_GRID_PLACEMENT.cvvLabel,
    };
}
