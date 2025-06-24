import * as domUtils from '@bigcommerce/checkout/dom-utils';

import { getAppearanceForOCSElement, getFonts } from './getStripeOCSStyles';

describe('getStripeOCSStyles', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAppearanceForOCSElement', () => {
        const containerId = 'stripe-ocs-container-id';
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
            [`#${containerId}--accordion-header .form-label::before`]: {
                'border-color': 'black',
                'border-width': '1px',
                width: '30px',
            },
            [`#${containerId}--accordion-header-selected .form-label::before`]: {
                'border-color': '#4496f6',
            },
            [`#${containerId}--accordion-header-selected`]: {
                'background-color': '#fcfcfc',
            },
        };

        const mockGetAppliedStyles = (
            properties: Record<string, Record<string, string | undefined>>,
        ) => {
            jest.spyOn(domUtils, 'getAppliedStyles').mockImplementation(
                jest
                    .fn()
                    .mockImplementation(
                        (element: HTMLElement, _proprties: string[], pseudoElement?: string) => {
                            let elementSelector = element.getAttribute('data-test-selector');

                            if (elementSelector && pseudoElement) {
                                elementSelector += pseudoElement;
                            }

                            return properties[elementSelector as keyof typeof defaultStyles];
                        },
                    ),
            );
        };

        beforeEach(() => {
            jest.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
                const element = document.createElement('div');

                element.setAttribute('data-test-selector', selector);

                return element;
            });

            mockGetAppliedStyles(defaultStyles);
        });

        it('returns the correct styles for the OCS element', () => {
            expect(getAppearanceForOCSElement(containerId)).toEqual({
                variables: {
                    colorPrimary: '0 0 5px rgba(0, 0, 0, 0.5)',
                    colorBackground: 'white',
                    colorText: 'blue',
                    colorDanger: 'red',
                    colorTextSecondary: 'blue',
                    colorTextPlaceholder: 'black',
                    colorIcon: 'black',
                    fontFamily: 'Monaco, sans-serif',
                },
                rules: {
                    '.Input': {
                        borderColor: 'gray',
                        color: 'black',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                    },
                    '.AccordionItem': {
                        borderRadius: 0,
                        borderWidth: 0,
                        borderBottom: '1px solid black',
                        boxShadow: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'green',
                        padding: '10px 10px 10px 18px',
                    },
                    '.AccordionItem:hover': {
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                    },
                    '.AccordionItem--selected': {
                        fontWeight: 'bold',
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                    },
                    '.TabLabel': {
                        color: 'green',
                    },
                    '.RadioIcon': {
                        width: '34.09px',
                    },
                    '.RadioIconInner': {
                        r: '29.04',
                        fill: '#4496f6',
                    },
                    '.RadioIconOuter': {
                        strokeWidth: '2.93px',
                        stroke: 'black',
                    },
                    '.RadioIconOuter--checked': {
                        stroke: '#4496f6',
                    },
                },
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

            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        fontFamily: 'Arial, sans-serif',
                    }),
                }),
            );
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

            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.AccordionItem': {
                            borderRadius: 0,
                            borderWidth: 0,
                            borderBottom: '1px solid black',
                            boxShadow: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'green',
                            padding: '13px 18px 13px 18px',
                        },
                    }),
                }),
            );
        });

        it('returns the default Stripe styles when no BC accordion element provided', () => {
            jest.spyOn(document, 'querySelector').mockReturnValue(null);

            expect(getAppearanceForOCSElement(containerId)).toEqual({
                variables: {
                    colorPrimary: undefined,
                    colorBackground: undefined,
                    colorText: undefined,
                    colorDanger: undefined,
                    colorTextSecondary: undefined,
                    colorTextPlaceholder: undefined,
                    colorIcon: undefined,
                    fontFamily: undefined,
                },
                rules: {
                    '.Input': {
                        borderColor: undefined,
                        color: undefined,
                        boxShadow: undefined,
                    },
                    '.AccordionItem': {
                        borderRadius: 0,
                        borderWidth: 0,
                        borderBottom: undefined,
                        boxShadow: 'none',
                        fontSize: undefined,
                        fontWeight: undefined,
                        color: undefined,
                        padding: undefined,
                    },
                    '.AccordionItem:hover': {
                        color: undefined,
                        backgroundColor: undefined,
                    },
                    '.AccordionItem--selected': {
                        fontWeight: 'bold',
                        color: undefined,
                        backgroundColor: undefined,
                    },
                    '.TabLabel': {
                        color: undefined,
                    },
                    '.RadioIcon': {
                        width: '29.55px',
                    },
                    '.RadioIconInner': {
                        r: '28.77',
                        fill: undefined,
                    },
                    '.RadioIconOuter': {
                        strokeWidth: '3.38px',
                        stroke: undefined,
                    },
                    '.RadioIconOuter--checked': {
                        stroke: undefined,
                    },
                },
            });
        });
    });
});

describe('getFonts', () => {
    const fontLink = 'https://fonts.googleapis.com/font.woff2';

    beforeEach(() => {
        jest.spyOn(document, 'querySelectorAll').mockImplementation((selector: string) => {
            const element = document.createElement('div');

            element.setAttribute('data-test-selector', selector);
            element.setAttribute('href', fontLink);

            return [element] as unknown as NodeListOf<Element>;
        });
    });

    it('get font source for default selector', () => {
        expect(getFonts()).toEqual([
            {
                cssSrc: fontLink,
            },
        ]);
    });

    it('get font source for custom selector', () => {
        expect(getFonts('link[href*="font"]')).toEqual([
            {
                cssSrc: fontLink,
            },
        ]);
    });

    it('returns empty array when element by selector does not found', () => {
        jest.spyOn(document, 'querySelectorAll').mockImplementation(() => {
            return [null] as unknown as NodeListOf<Element>;
        });

        expect(getFonts()).toEqual([]);
    });

    it('returns empty array when element by selector does not have font source', () => {
        jest.spyOn(document, 'querySelectorAll').mockImplementation((selector: string) => {
            const element = document.createElement('div');

            element.setAttribute('data-test-selector', selector);

            return [element] as unknown as NodeListOf<Element>;
        });

        expect(getFonts()).toEqual([]);
    });
});
