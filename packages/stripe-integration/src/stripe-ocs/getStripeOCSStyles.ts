import { isEmpty } from 'lodash';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

const getStylesFromElement = (selector: string, properties: string[]) => {
    const element = document.querySelector<HTMLElement>(selector);

    return element ? getAppliedStyles(element, properties) : {};
};

const getFontsSrc = (selector: string) => {
    const elementsList: NodeListOf<Element> = document.querySelectorAll(selector);
    const fontsList: string[] = [];

    elementsList.forEach((element: Element | null) => {
        const fontSrc = element?.getAttribute('href');

        if (fontSrc) {
            fontsList.push(fontSrc);
        }
    });

    return fontsList;
};

export const getStylesForOCSElement = (
    containerId: string,
): Record<string, string | string[] | undefined> => {
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
    const fontsSrc = getFontsSrc('link[href*="font"]');

    const defaultAccordionPaddingHorizontal = '18px';
    const defaultAccordionPaddingVertical = '13px';
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

    return {
        labelText: formLabelStyles.color,
        fieldText: formInputStyles.color,
        fieldPlaceholderText: formInputStyles.color,
        fieldErrorText: formErrorStyles.color,
        fieldBackground: formInputStyles['background-color'],
        fieldInnerShadow: formInputStyles['box-shadow'],
        fieldBorder: formInputStyles['border-color'],
        accordionHeaderPadding,
        fontFamily: accordionHeaderFontFamily || formInputStyles['font-family'],
        accordionItemTitleFontSize,
        accordionItemTitleFontWeight,
        accordionHeaderColor,
        accordionBorderBottom: formChecklistStyles['border-bottom'],
        fontsSrc,
    };
};
