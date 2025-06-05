import { StripeAppearanceOptions, StripeCustomFont } from '@bigcommerce/checkout-sdk';
import { isEmpty } from 'lodash';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

const getStylesFromElement = (selector: string, properties: string[]) => {
    const element = document.querySelector<HTMLElement>(selector);

    return element ? getAppliedStyles(element, properties) : {};
};

const parseRadioIconSize = (size: string | number = 0): number =>
    typeof size !== 'number' ? parseInt(size, 10) : size;

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
        innerRadius: `${stripeEqualInnerRadius}px`,
    };
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

    const formInputStyles = getStylesFromElement(`#${containerId}--input`, [
        'color',
        'background-color',
        'border-color',
        'box-shadow',
        'font-family',
    ]);
    const formLabelStyles = getStylesFromElement(`#${containerId}--label`, ['color']);
    const formErrorStyles = getStylesFromElement(`#${containerId}--error`, ['color']);
    const accordionHeaderStyles = getStylesFromElement(
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
    const formChecklistStyles = getStylesFromElement(`.checkout-step--payment .form-checklist`, [
        'border-bottom',
    ]);
    const {
        color: accordionHeaderColor,
        'font-size': accordionItemTitleFontSize,
        'font-family': accordionHeaderFontFamily,
        'font-weight': accordionItemTitleFontWeight,
        'padding-top': accordionPaddingTop = defaultAccordionPaddingVertical,
        'padding-right': accordionPaddingRight = defaultAccordionPaddingHorizontal,
        'padding-bottom': accordionPaddingBottom = defaultAccordionPaddingVertical,
    } = accordionHeaderStyles;
    const accordionHeaderPadding = !isEmpty(accordionHeaderStyles)
        ? `${accordionPaddingTop} ${accordionPaddingRight} ${accordionPaddingBottom} ${defaultAccordionPaddingHorizontal}`
        : undefined;

    const radioIconSize = getRadioIconSizes();
    const radioIconColor = '#ddd'; // TODO: get style from theme
    const radioIconFocusColor = '#4496f6'; // TODO: get style from theme

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
                boxShadow: 'none',
                fontSize: accordionItemTitleFontSize,
                fontWeight: accordionItemTitleFontWeight,
                color: accordionHeaderColor,
                padding: accordionHeaderPadding,
            },
            '.AccordionItem--selected': {
                fontWeight: 'bold',
                color: accordionHeaderColor,
            },
            '.TabLabel': {
                color: accordionHeaderColor,
            },
            '.RadioIcon': {
                width: radioIconSize.outerWidth,
            },
            '.RadioIconInner': {
                r: radioIconSize.innerRadius,
                fill: radioIconFocusColor,
            },
            '.RadioIconOuter': {
                strokeWidth: radioIconSize.outerStrokeWidth,
                stroke: radioIconColor,
            },
            '.RadioIconOuter--checked': {
                stroke: radioIconFocusColor,
            },
        },
    };
};
