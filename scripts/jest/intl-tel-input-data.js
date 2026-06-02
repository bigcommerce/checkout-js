"use strict";
// Jest-only stub for intl-tel-input/data.
// Format: [iso2, dialCode, priority, areaCodes, nationalPrefix]
const rawCountryData = [
    ["au", "61", 0, null, null],
    ["ca", "1", 1, null, "1"],
    ["gb", "44", 0, null, "0"],
    ["us", "1", 0, null, "1"],
];

module.exports = { rawCountryData };
