import { EmbeddedCheckoutStyles } from '@bigcommerce/checkout-sdk';

import { toCSSRule } from '../common/dom';

export default class EmbeddedCheckoutStyleParser {
    parse(styles: EmbeddedCheckoutStyles): string[] {
        const rules: string[] = [];

        if (styles.body) {
            rules.push(toCSSRule('body', styles.body));
            rules.push(toCSSRule('.optimizedCheckout-overlay', styles.body));
        }

        if (styles.text) {
            rules.push(toCSSRule('.optimizedCheckout-contentPrimary', styles.text));
        }

        if (styles.secondaryText) {
            rules.push(toCSSRule('.optimizedCheckout-contentSecondary', styles.secondaryText));
        }

        if (styles.heading) {
            rules.push(toCSSRule('.optimizedCheckout-headingPrimary', styles.heading));
        }

        if (styles.secondaryHeading) {
            rules.push(toCSSRule('.optimizedCheckout-headingSecondary', styles.secondaryHeading));
        }

        if (styles.link) {
            rules.push(toCSSRule('a', styles.link));
            rules.push(toCSSRule('a:focus', styles.link, styles.link.focus));
            rules.push(toCSSRule('a:hover', styles.link, styles.link.hover));
        }

        if (styles.label) {
            rules.push(toCSSRule('.optimizedCheckout-form-label', styles.label));
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-label',
                    styles.label,
                    styles.label.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .form-inlineMessage',
                    styles.label,
                    styles.label.error,
                ),
            );
        }

        if (styles.button) {
            rules.push(toCSSRule('.optimizedCheckout-buttonPrimary', styles.button));
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary:active',
                    styles.button,
                    styles.button.active,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary:focus',
                    styles.button,
                    styles.button.focus,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary:hover',
                    styles.button,
                    styles.button.hover,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled]',
                    styles.button,
                    styles.button.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled]:active',
                    styles.button,
                    styles.button.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled]:focus',
                    styles.button,
                    styles.button.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled]:hover',
                    styles.button,
                    styles.button.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled].is-active',
                    styles.button,
                    styles.button.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonPrimary[disabled].is-loading',
                    styles.button,
                    styles.button.disabled,
                ),
            );
        }

        if (styles.secondaryButton) {
            rules.push(toCSSRule('.optimizedCheckout-buttonSecondary', styles.secondaryButton));
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary:active',
                    styles.secondaryButton,
                    styles.secondaryButton.active,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary:focus',
                    styles.secondaryButton,
                    styles.secondaryButton.focus,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary:hover',
                    styles.secondaryButton,
                    styles.secondaryButton.hover,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled]',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled]:active',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled]:focus',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled]:hover',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled].is-active',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-buttonSecondary[disabled].is-loading',
                    styles.secondaryButton,
                    styles.secondaryButton.disabled,
                ),
            );
        }

        if (styles.input) {
            rules.push(toCSSRule('.optimizedCheckout-form-input', styles.input));
            rules.push(
                toCSSRule('.optimizedCheckout-form-input:focus', styles.input, styles.input.focus),
            );
            rules.push(
                toCSSRule('.optimizedCheckout-form-input:hover', styles.input, styles.input.hover),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-input::placeholder',
                    styles.input,
                    styles.input.placeholder,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-input',
                    styles.input,
                    styles.input.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-input:focus',
                    styles.input,
                    styles.input.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-input:hover',
                    styles.input,
                    styles.input.error,
                ),
            );
        }

        if (styles.select) {
            rules.push(toCSSRule('.optimizedCheckout-form-select', styles.select));
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-select:focus',
                    styles.select,
                    styles.select.focus,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-select:hover',
                    styles.select,
                    styles.select.hover,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-select',
                    styles.select,
                    styles.select.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-select:focus',
                    styles.select,
                    styles.select.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-select:hover',
                    styles.select,
                    styles.select.error,
                ),
            );
        }

        if (styles.checkbox) {
            rules.push(toCSSRule('.optimizedCheckout-form-checkbox', styles.checkbox));
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-checkbox:focus',
                    styles.checkbox,
                    styles.checkbox.focus,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-checkbox:hover',
                    styles.checkbox,
                    styles.checkbox.hover,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-checkbox',
                    styles.checkbox,
                    styles.checkbox.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-checkbox:focus',
                    styles.checkbox,
                    styles.checkbox.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-checkbox:hover',
                    styles.checkbox,
                    styles.checkbox.error,
                ),
            );
        }

        if (styles.radio) {
            rules.push(toCSSRule('.optimizedCheckout-form-radio', styles.radio));
            rules.push(
                toCSSRule('.optimizedCheckout-form-radio:focus', styles.radio, styles.radio.focus),
            );
            rules.push(
                toCSSRule('.optimizedCheckout-form-radio:hover', styles.radio, styles.radio.hover),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-radio',
                    styles.radio,
                    styles.radio.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-radio:focus',
                    styles.radio,
                    styles.radio.error,
                ),
            );
            rules.push(
                toCSSRule(
                    '.form-field--error .optimizedCheckout-form-radio:hover',
                    styles.radio,
                    styles.radio.error,
                ),
            );
        }

        if (styles.step) {
            rules.push(toCSSRule('.optimizedCheckout-checkoutStep', styles.step));
            rules.push(toCSSRule('.optimizedCheckout-step', styles.step.icon));
        }

        if (styles.checklist) {
            rules.push(toCSSRule('.optimizedCheckout-form-checklist', styles.checklist));
            rules.push(toCSSRule('.optimizedCheckout-form-checklist-item', styles.checklist));
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-checklist-item:hover',
                    styles.checklist,
                    styles.checklist.hover,
                ),
            );
            rules.push(
                toCSSRule(
                    '.optimizedCheckout-form-checklist-item--selected',
                    styles.checklist,
                    styles.checklist.checked,
                ),
            );
        }

        if (styles.discountBanner) {
            rules.push(toCSSRule('.optimizedCheckout-discountBanner', styles.discountBanner));
        }

        if (styles.loadingBanner) {
            rules.push(toCSSRule('.optimizedCheckout-loadingToaster', styles.loadingBanner));
        }

        if (styles.orderSummary) {
            rules.push(toCSSRule('.optimizedCheckout-orderSummary', styles.orderSummary));
            rules.push(
                toCSSRule('.optimizedCheckout-orderSummary-cartSection', styles.orderSummary),
            );
        }

        return rules;
    }
}
