import * as domUtils from '@bigcommerce/checkout/dom-utils';

import { getStylesForOCSElement } from './getStripeOCSStyles';

describe('getStylesForOCSElement', () => {
    const containerId = 'stripe-ocs-container-id';
    const fontLink = 'https://fonts.googleapis.com/font.woff2';
    const defaultStyles: Record<string, Record<string, string | undefined>> = {
        [`#${containerId}--input`]: {
            color: 'black',
            'background-color': 'white',
            'border-color': 'gray',
            'box-shadow': '0 0 5px rgba(0, 0, 0, 0.5)',
            'font-family': 'Arial, sans-serif',
        },
        [`#${containerId}--label`]: {
            color: 'blue',
        },
        [`#${containerId}--error`]: {
            color: 'red',
        },
        [`#${containerId}--accordion-header .form-label`]: {
            color: 'green',
            'font-size': '16px',
            'font-family': 'Monaco, sans-serif',
            'font-weight': 'bold',
            'padding-top': '10px',
            'padding-right': '10px',
            'padding-bottom': '10px',
        },
        '.checkout-step--payment .form-checklist': {
            'border-bottom': '1px solid black',
        },
    };

    const mockGetAppliedStyles = (
        properties: Record<string, Record<string, string | undefined>>,
    ) => {
        jest.spyOn(domUtils, 'getAppliedStyles').mockImplementation(
            jest.fn().mockImplementation((element: HTMLElement) => {
                const elementSelector = element.getAttribute('data-test-selector');

                return properties[elementSelector as keyof typeof defaultStyles];
            }),
        );
    };

    beforeEach(() => {
        jest.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
            const element = document.createElement('div');

            element.setAttribute('data-test-selector', selector);

            return element;
        });

        jest.spyOn(document, 'querySelectorAll').mockImplementation((selector: string) => {
            const element = document.createElement('div');

            element.setAttribute('data-test-selector', selector);
            element.setAttribute('href', fontLink);

            return [element] as NodeListOf<Element>;
        });

        mockGetAppliedStyles(defaultStyles);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns the correct styles for the OCS element', () => {
        expect(getStylesForOCSElement(containerId)).toEqual({
            labelText: 'blue',
            fieldErrorText: 'red',
            fieldText: 'black',
            fieldPlaceholderText: 'black',
            fieldBackground: 'white',
            fieldInnerShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            fieldBorder: 'gray',
            fontFamily: 'Monaco, sans-serif',
            accordionItemTitleFontSize: '16px',
            accordionItemTitleFontWeight: 'bold',
            accordionHeaderColor: 'green',
            accordionHeaderPadding: '10px 10px 10px 18px',
            accordionBorderBottom: '1px solid black',
            fontsSrc: ['https://fonts.googleapis.com/font.woff2'],
        });
    });

    it('returns the field input font family styles when no accordion font family provided', () => {
        mockGetAppliedStyles({
            ...defaultStyles,
            [`#${containerId}--accordion-header .form-label`]: {
                ...defaultStyles[`#${containerId}--accordion-header .form-label`],
                'font-family': undefined,
            },
        });

        expect(getStylesForOCSElement(containerId)).toEqual({
            labelText: 'blue',
            fieldErrorText: 'red',
            fieldText: 'black',
            fieldPlaceholderText: 'black',
            fieldBackground: 'white',
            fieldInnerShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            fieldBorder: 'gray',
            fontFamily: 'Arial, sans-serif',
            accordionItemTitleFontSize: '16px',
            accordionItemTitleFontWeight: 'bold',
            accordionHeaderColor: 'green',
            accordionHeaderPadding: '10px 10px 10px 18px',
            accordionBorderBottom: '1px solid black',
            fontsSrc: ['https://fonts.googleapis.com/font.woff2'],
        });
    });

    it('returns the default padding styles when no accordion paddings provided', () => {
        mockGetAppliedStyles({
            ...defaultStyles,
            [`#${containerId}--accordion-header .form-label`]: {
                ...defaultStyles[`#${containerId}--accordion-header .form-label`],
                'padding-top': undefined,
                'padding-right': undefined,
                'padding-bottom': undefined,
            },
        });

        expect(getStylesForOCSElement(containerId)).toEqual({
            labelText: 'blue',
            fieldErrorText: 'red',
            fieldText: 'black',
            fieldPlaceholderText: 'black',
            fieldBackground: 'white',
            fieldInnerShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
            fieldBorder: 'gray',
            fontFamily: 'Monaco, sans-serif',
            accordionItemTitleFontSize: '16px',
            accordionItemTitleFontWeight: 'bold',
            accordionHeaderColor: 'green',
            accordionHeaderPadding: '13px 18px 13px 18px',
            accordionBorderBottom: '1px solid black',
            fontsSrc: ['https://fonts.googleapis.com/font.woff2'],
        });
    });

    it('returns the default Stripe font family styles when no BC fonts found', () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);
        jest.spyOn(document, 'querySelectorAll').mockImplementation(() => {
            return [null] as NodeListOf<Element>;
        });

        expect(getStylesForOCSElement(containerId)).toEqual({
            labelText: undefined,
            fieldErrorText: undefined,
            fieldText: undefined,
            fieldPlaceholderText: undefined,
            fieldBackground: undefined,
            fieldInnerShadow: undefined,
            fieldBorder: undefined,
            fontFamily: undefined,
            accordionItemTitleFontSize: undefined,
            accordionItemTitleFontWeight: undefined,
            accordionHeaderColor: undefined,
            accordionHeaderPadding: undefined,
            accordionBorderBottom: undefined,
            fontsSrc: [],
        });
    });

    it('returns the default Stripe styles when no BC accordion element provided', () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);
        jest.spyOn(document, 'querySelectorAll').mockReturnValue([] as NodeListOf<Element>);

        expect(getStylesForOCSElement(containerId)).toEqual({
            labelText: undefined,
            fieldErrorText: undefined,
            fieldText: undefined,
            fieldPlaceholderText: undefined,
            fieldBackground: undefined,
            fieldInnerShadow: undefined,
            fieldBorder: undefined,
            fontFamily: undefined,
            accordionItemTitleFontSize: undefined,
            accordionItemTitleFontWeight: undefined,
            accordionHeaderColor: undefined,
            accordionHeaderPadding: undefined,
            accordionBorderBottom: undefined,
            fontsSrc: [],
        });
    });
});
