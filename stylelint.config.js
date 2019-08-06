module.exports = {
    extends: 'stylelint-config-standard',
    plugins: ['stylelint-order'],
    rules: {
        indentation: 4,
        'order/properties-alphabetical-order': true,
        'function-name-case': null,
        'at-rule-no-unknown': null,
        'at-rule-empty-line-before': null,
        'selector-type-no-unknown': null,
        'no-descending-specificity': null,
    },
};
