import { isEmpty } from 'lodash';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

import type { StripeAppearanceOptions, StripeCustomFont } from '../stripe-types';

const getStylesFromElement = (
    selector: string,
    properties: string[],
    pseudoElementSelector?: string,
) => {
    const element = document.querySelector<HTMLElement>(selector);

    return element ? getAppliedStyles(element, properties, pseudoElementSelector) : {};
};

const parseRadioIconSize = (size: string | number = 0): number =>
    typeof size !== 'number' ? parseFloat(size) : size;

const getRadioIconSizes = (sizes?: Record<string, string | number | undefined>) => {
    const {
        radioIconOuterWidth = 26,
        radioIconOuterStrokeWidth = 1,
        radioIconInnerWidth = 17,
    } = sizes || {};
    const stripeSVGSizeCoefficient = 0.88; // Provided by Stripe team for scaling SVGs.

    const percentageCoefficient = stripeSVGSizeCoefficient * 100;
    const outerWidth = parseRadioIconSize(radioIconOuterWidth);
    const outerStrokeWidth = parseRadioIconSize(radioIconOuterStrokeWidth);
    const innerWidth = parseRadioIconSize(radioIconInnerWidth);

    const stripeEqualOuterWidth = (outerWidth / stripeSVGSizeCoefficient).toFixed(2);
    const stripeEqualOuterStrokeWidth = (
        (outerStrokeWidth / outerWidth) *
        percentageCoefficient
    ).toFixed(2);
    const stripeEqualInnerRadius = (
        ((innerWidth / outerWidth) * percentageCoefficient) /
        2
    ).toFixed(2);

    return {
        outerWidth: `${stripeEqualOuterWidth}px`,
        outerStrokeWidth: `${stripeEqualOuterStrokeWidth}px`,
        innerRadius: stripeEqualInnerRadius,
    };
};

const getScaleFromTransformMatrix = (transformMatrixString = ''): number | undefined => {
    const transformMatrixRegex = /matrix\(([^)]+)\)/;
    const transformMatrix = transformMatrixRegex.exec(transformMatrixString);

    if (!transformMatrix) {
        return undefined;
    }

    const matrixValues = transformMatrix[1].split(',').map((value) => parseFloat(value.trim()));

    return matrixValues[0];
};

export const getFonts = (selector = 'link[href*="font"]'): StripeCustomFont[] => {
    const elementsList: NodeListOf<Element> = document.querySelectorAll(selector);
    const fonts: StripeCustomFont[] = [];

    elementsList.forEach((element: Element | null) => {
        const fontSrc = element?.getAttribute('href');

        if (fontSrc) {
            fonts.push({ cssSrc: fontSrc });
        }
    });

    return fonts;
};

export const getAppearanceForOCSElement = (containerId: string): StripeAppearanceOptions => {
    const defaultAccordionPaddingHorizontal = '18px';
    const defaultAccordionPaddingVertical = '13px';
    const defaultRadioIconInnerScale = 0.66;

    const formInputStyles = getStylesFromElement(`#${containerId}--input`, [
        'color',
        'background-color',
        'border-color',
        'box-shadow',
        'font-family',
    ]);
    const formLabelStyles = getStylesFromElement(`#${containerId}--label`, ['color']);
    const formErrorStyles = getStylesFromElement(`#${containerId}--error`, ['color']);
    const accordionHeaderLabelStyles = getStylesFromElement(
        `#${containerId}--accordion-header .form-label`,
        [
            'color',
            'font-size',
            'font-family',
            'font-weight',
            'padding-top',
            'padding-right',
            'padding-bottom',
        ],
    );
    const accordionHeaderStyles = getStylesFromElement(`#${containerId}--accordion-header`, [
        'background-color',
    ]);
    const accordionSelectedHeaderStyles = getStylesFromElement(
        `#${containerId}--accordion-header-selected`,
        ['background-color'],
    );
    const formChecklistStyles = getStylesFromElement(
        `#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`,
        ['border-bottom', 'border-color'],
    );
    const {
        color: accordionHeaderColor,
        'font-size': accordionItemTitleFontSize,
        'font-family': accordionHeaderFontFamily,
        'font-weight': accordionItemTitleFontWeight,
        'padding-top': accordionPaddingTop = defaultAccordionPaddingVertical,
        'padding-right': accordionPaddingRight = defaultAccordionPaddingHorizontal,
        'padding-bottom': accordionPaddingBottom = defaultAccordionPaddingVertical,
    } = accordionHeaderLabelStyles;
    const accordionHeaderPadding = !isEmpty(accordionHeaderLabelStyles)
        ? `${accordionPaddingTop} ${accordionPaddingRight} ${accordionPaddingBottom} ${defaultAccordionPaddingHorizontal}`
        : undefined;
    const radioOuter = getStylesFromElement(
        `#${containerId}--accordion-header .form-label`,
        ['border-color', 'border-width', 'width', 'background-color'],
        '::before',
    );
    const radioInner = getStylesFromElement(
        `#${containerId}--accordion-header .form-label`,
        ['border-color', 'border-width', 'width', 'background-color'],
        '::after',
    );
    const radioOuterChecked = getStylesFromElement(
        `#${containerId}--accordion-header-selected .form-label`,
        ['border-color', 'background-color'],
        '::before',
    );
    let radioInnerChecked = getStylesFromElement(
        `.form-checklist-header--selected .form-label`,
        ['border-color', 'background-color', 'width', 'transform'],
        '::after',
    );

    if (isEmpty(radioInnerChecked)) {
        radioInnerChecked = getStylesFromElement(
            `#${containerId}--accordion-header-selected .form-label`,
            ['border-color', 'background-color', 'width', 'transform'],
            '::after',
        );
    }

    const radioInnerParsedSize = radioInnerChecked.width || radioOuter.width;
    const radioInnerWidthScale =
        getScaleFromTransformMatrix(radioInnerChecked.transform) || defaultRadioIconInnerScale;
    const radioIconSize = getRadioIconSizes({
        radioIconOuterWidth: radioOuter.width,
        radioIconOuterStrokeWidth: radioOuter['border-width'],
        radioIconInnerWidth:
            radioInnerParsedSize && parseRadioIconSize(radioInnerParsedSize) * radioInnerWidthScale,
    });

    return {
        variables: {
            colorPrimary: formInputStyles['box-shadow'],
            colorBackground: formInputStyles['background-color'],
            colorText: formLabelStyles.color,
            colorDanger: formErrorStyles.color,
            colorTextSecondary: formLabelStyles.color,
            colorTextPlaceholder: formInputStyles.color,
            colorIcon: formInputStyles.color,
            fontFamily: accordionHeaderFontFamily || formInputStyles['font-family'],
        },
        rules: {
            '.Input': {
                borderColor: formInputStyles['border-color'],
                color: formInputStyles.color,
                boxShadow: formInputStyles['box-shadow'],
            },
            '.AccordionItem': {
                borderRadius: 0,
                borderWidth: 0,
                borderBottom: formChecklistStyles['border-bottom'],
                borderColor: formChecklistStyles['border-color'],
                backgroundColor: accordionHeaderStyles['background-color'],
                boxShadow: 'none',
                fontSize: accordionItemTitleFontSize,
                fontWeight: accordionItemTitleFontWeight,
                color: accordionHeaderColor,
                padding: accordionHeaderPadding,
            },
            '.AccordionItem:hover': {
                backgroundColor: accordionSelectedHeaderStyles['background-color'],
                color: accordionHeaderColor,
            },
            '.AccordionItem--selected': {
                fontWeight: 'bold',
                color: accordionHeaderColor,
                backgroundColor: accordionSelectedHeaderStyles['background-color'],
            },
            '.TabLabel': {
                color: accordionHeaderColor,
            },
            '.RadioIcon': {
                width: radioIconSize.outerWidth,
            },
            '.RadioIconInner': {
                r: radioIconSize.innerRadius,
                fill: radioInner['background-color'],
            },
            '.RadioIconOuter': {
                strokeWidth: radioIconSize.outerStrokeWidth,
                stroke: radioOuter['border-color'],
                fill: radioOuter['background-color'],
            },
            '.RadioIconInner--checked': {
                r: radioIconSize.innerRadius,
                fill: radioInnerChecked['background-color'],
            },
            '.RadioIconOuter--checked': {
                stroke: radioOuterChecked['border-color'],
                fill: radioOuterChecked['background-color'],
            },
        },
    };
};
