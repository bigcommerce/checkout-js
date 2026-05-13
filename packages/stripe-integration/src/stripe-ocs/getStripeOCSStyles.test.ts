import * as domUtils from '@bigcommerce/checkout/dom-utils';

import { CheckoutTheme, getAppearanceForOCSElement, getFonts } from './getStripeOCSStyles';

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
            [`#${containerId}--accordion-header`]: {
                'background-color': '#fcfcfc',
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
            [`#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`]: {
                'border-bottom': '1px solid black',
                'border-top': '1px solid black',
                'border-left': '1px solid black',
                'border-right': '1px solid black',
                'border-color': 'yellow',
                'border-radius': '4px',
            },
            [`#${containerId}--accordion-header .form-label::before`]: {
                'border-color': 'black',
                'border-width': '1.5px',
                'background-color': 'white',
                width: '30px',
            },
            [`#${containerId}--accordion-header .form-label::after`]: {
                'border-color': 'black',
                'border-width': '1px',
                'background-color': 'white',
                width: '30px',
            },
            [`#${containerId}--accordion-header-selected .form-label::before`]: {
                'border-color': '#4496f6',
                'background-color': '#4496f6',
            },
            [`#${containerId}--accordion-header-selected .form-label::after`]: {
                'border-color': '#4496f6',
                'background-color': '#4496f6',
                transform: 'matrix(0.66, 0, 0, 0.66, 0, 0)',
            },
            [`#${containerId}--accordion-header-selected`]: {
                'background-color': '#fcfcfc',
                'border-color': '#4496f6',
                'margin-bottom': '8px',
                'margin-top': '8px',
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
                    accordionItemSpacing: '16px',
                },
                rules: {
                    '.Input': {
                        borderColor: 'gray',
                        color: 'black',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                    },
                    '.AccordionItem': {
                        borderRadius: '4px',
                        borderTop: '1px solid black',
                        borderRight: '1px solid black',
                        borderBottom: '1px solid black',
                        borderLeft: '1px solid black',
                        borderColor: 'yellow',
                        backgroundColor: '#fcfcfc',
                        boxShadow: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'green',
                        padding: '10px 10px 10px 18px',
                    },
                    '.AccordionItem:hover': {
                        backgroundColor: '#fcfcfc',
                        color: 'green',
                    },
                    '.AccordionItem--selected': {
                        fontWeight: 'bold',
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                        borderColor: '#4496f6',
                    },
                    '.TabLabel': {
                        color: 'green',
                    },
                    '.RadioIcon': {
                        width: '34.09px',
                    },
                    '.RadioIconInner': {
                        r: '29.04',
                        fill: 'white',
                    },
                    '.RadioIconInner--checked': {
                        r: '29.04',
                        fill: '#4496f6',
                    },
                    '.RadioIconOuter': {
                        strokeWidth: '4.40px',
                        stroke: 'black',
                        fill: 'white',
                    },
                    '.RadioIconOuter--checked': {
                        fill: '#4496f6',
                        stroke: '#4496f6',
                    },
                    '.ToggleItem': {
                        borderRadius: '4px',
                        border: '1px solid black',
                        backgroundColor: '#fcfcfc',
                        boxShadow: 'none',
                        outline: 'none',
                    },
                    '.ToggleItem--selected': {
                        fontWeight: 'bold',
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                        borderColor: '#4496f6',
                        outline: 'none',
                        boxShadow: 'none',
                    },
                },
            });
        });

        it('returns the correct styles for the OCS element and themeV2', () => {
            expect(getAppearanceForOCSElement(containerId, CheckoutTheme.THEME_V2)).toEqual({
                variables: {
                    colorPrimary: '0 0 5px rgba(0, 0, 0, 0.5)',
                    colorBackground: 'white',
                    colorText: 'blue',
                    colorDanger: 'red',
                    colorTextSecondary: 'blue',
                    colorTextPlaceholder: 'black',
                    colorIcon: 'black',
                    fontFamily: 'Monaco, sans-serif',
                    accordionItemSpacing: '16px',
                },
                rules: {
                    '.Input': {
                        borderColor: 'gray',
                        color: 'black',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
                    },
                    '.AccordionItem': {
                        borderRadius: '4px',
                        borderTop: '1px solid black',
                        borderRight: '1px solid black',
                        borderBottom: '1px solid black',
                        borderLeft: '1px solid black',
                        borderColor: 'yellow',
                        backgroundColor: '#fcfcfc',
                        boxShadow: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'green',
                        padding: '10px 10px 10px 18px',
                    },
                    '.AccordionItem:hover': {
                        backgroundColor: '#fcfcfc',
                        color: 'green',
                    },
                    '.AccordionItem--selected': {
                        fontWeight: 'bold',
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                        borderColor: '#4496f6',
                    },
                    '.TabLabel': {
                        color: 'green',
                    },
                    '.RadioIcon': {
                        width: '34.09px',
                    },
                    '.RadioIconInner': {
                        r: '29.04',
                        fill: 'white',
                    },
                    '.RadioIconInner--checked': {
                        r: '29.04',
                        fill: '#4496f6',
                    },
                    '.RadioIconOuter': {
                        strokeWidth: '4.40px',
                        stroke: 'black',
                        fill: 'white',
                    },
                    '.RadioIconOuter--checked': {
                        fill: '#4496f6',
                        stroke: '#4496f6',
                    },
                    '.ToggleItem': {
                        borderRadius: '4px',
                        border: '1px solid black',
                        backgroundColor: '#fcfcfc',
                        boxShadow: 'none',
                        outline: 'none',
                    },
                    '.ToggleItem--selected': {
                        fontWeight: 'bold',
                        color: 'green',
                        backgroundColor: '#fcfcfc',
                        borderColor: '#4496f6',
                        outline: 'none',
                        boxShadow: 'none',
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
                            borderRadius: '4px',
                            borderTop: '1px solid black',
                            borderRight: '1px solid black',
                            borderBottom: '1px solid black',
                            borderLeft: '1px solid black',
                            borderColor: 'yellow',
                            backgroundColor: '#fcfcfc',
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
                    accordionItemSpacing: '0px',
                },
                rules: {
                    '.Input': {
                        borderColor: undefined,
                        color: undefined,
                        boxShadow: undefined,
                    },
                    '.AccordionItem': {
                        borderRadius: undefined,
                        borderTop: undefined,
                        borderRight: undefined,
                        borderBottom: undefined,
                        borderLeft: undefined,
                        borderColor: undefined,
                        backgroundColor: undefined,
                        boxShadow: 'none',
                        fontSize: undefined,
                        fontWeight: undefined,
                        color: undefined,
                        padding: undefined,
                    },
                    '.AccordionItem:hover': {
                        backgroundColor: undefined,
                        color: undefined,
                    },
                    '.AccordionItem--selected': {
                        fontWeight: 'bold',
                        color: undefined,
                        backgroundColor: undefined,
                        borderColor: undefined,
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
                    '.RadioIconInner--checked': {
                        r: '28.77',
                        fill: undefined,
                    },
                    '.RadioIconOuter': {
                        strokeWidth: '3.38px',
                        stroke: undefined,
                        fill: undefined,
                    },
                    '.RadioIconOuter--checked': {
                        stroke: undefined,
                        fill: undefined,
                    },
                    '.ToggleItem': {
                        borderRadius: '4px',
                        border: undefined,
                        backgroundColor: undefined,
                        boxShadow: 'none',
                        outline: 'none',
                    },
                    '.ToggleItem--selected': {
                        fontWeight: 'bold',
                        color: undefined,
                        backgroundColor: undefined,
                        outline: 'none',
                        boxShadow: 'none',
                    },
                },
            });
        });

        it('returns the default radio icon scales for default checkout theme', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected .form-label::after`]: {
                    'border-color': '#4496f6',
                    'background-color': '#4496f6',
                },
            });

            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.RadioIconInner': {
                            r: '29.04',
                            fill: 'white',
                        },
                    }),
                }),
            );
        });

        it('returns the default radio icon scales for checkout theme v2', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected .form-label::after`]: {
                    'border-color': '#4496f6',
                    'background-color': '#4496f6',
                },
            });

            expect(getAppearanceForOCSElement(containerId, CheckoutTheme.THEME_V2)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.RadioIconInner': {
                            r: '15.84',
                            fill: 'white',
                        },
                    }),
                }),
            );
        });

        it('returns the default radio icon scales from existing checkout element', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected .form-label::after`]: {
                    'border-color': '#4496f6',
                    'background-color': '#4496f6',
                    transform: 'matrix(0.8, 0, 0, 0.8, 0, 0)',
                },
            });

            expect(getAppearanceForOCSElement(containerId, CheckoutTheme.THEME_V2)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.RadioIconInner': {
                            r: '35.20',
                            fill: 'white',
                        },
                    }),
                }),
            );
        });

        it('sums accordion header top and bottom margins into accordionItemSpacing', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected`]: {
                    ...defaultStyles[`#${containerId}--accordion-header-selected`],
                    'margin-top': '5px',
                    'margin-bottom': '7px',
                },
            });

            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        accordionItemSpacing: '12px',
                    }),
                }),
            );
        });

        it('falls back to 0px accordionItemSpacing when margins are missing', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected`]: {
                    ...defaultStyles[`#${containerId}--accordion-header-selected`],
                    'margin-top': undefined,
                    'margin-bottom': undefined,
                },
            });

            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    variables: expect.objectContaining({
                        accordionItemSpacing: '0px',
                    }),
                }),
            );
        });

        it('uses hardcoded 4px ToggleItem border radius and radio inner color for selected border in default theme', () => {
            expect(getAppearanceForOCSElement(containerId)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.ToggleItem': expect.objectContaining({
                            borderRadius: '4px',
                        }),
                        '.ToggleItem--selected': expect.objectContaining({
                            borderColor: '#4496f6',
                        }),
                    }),
                }),
            );
        });

        it('uses form checklist border radius and accordion selected border color for ToggleItem in themeV2', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`]: {
                    ...defaultStyles[
                        `#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`
                    ],
                    'border-radius': '12px',
                },
                [`#${containerId}--accordion-header-selected`]: {
                    ...defaultStyles[`#${containerId}--accordion-header-selected`],
                    'border-color': '#abcdef',
                },
            });

            expect(getAppearanceForOCSElement(containerId, CheckoutTheme.THEME_V2)).toEqual(
                expect.objectContaining({
                    rules: expect.objectContaining({
                        '.ToggleItem': expect.objectContaining({
                            borderRadius: '12px',
                        }),
                        '.ToggleItem--selected': expect.objectContaining({
                            borderColor: '#abcdef',
                        }),
                    }),
                }),
            );
        });

        it('omits ToggleItem borderRadius for themeV2 when form checklist border radius is missing', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`]: {
                    ...defaultStyles[
                        `#${containerId}--accordion-header.optimizedCheckout-form-checklist-item`
                    ],
                    'border-radius': undefined,
                },
            });

            const appearance = getAppearanceForOCSElement(containerId, CheckoutTheme.THEME_V2);

            expect(appearance.rules?.['.ToggleItem']).not.toHaveProperty('borderRadius');
        });

        it('omits ToggleItem--selected borderColor for default theme when radio inner background is missing', () => {
            mockGetAppliedStyles({
                ...defaultStyles,
                [`#${containerId}--accordion-header-selected .form-label::after`]: {
                    ...defaultStyles[
                        `#${containerId}--accordion-header-selected .form-label::after`
                    ],
                    'background-color': undefined,
                },
                '.form-checklist-header--selected .form-label::after': {
                    'background-color': undefined,
                },
            });

            const appearance = getAppearanceForOCSElement(containerId);

            expect(appearance.rules?.['.ToggleItem--selected']).not.toHaveProperty('borderColor');
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
