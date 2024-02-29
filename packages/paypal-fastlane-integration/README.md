# paypal-fastlane-integration

This library contains useful methods related to form fields.
1. `PoweredByPayPalFastlaneLabel` => a component that renders PayPal Fastlane logo.
2. `isPayPalFastlaneAddress` => is a method that helps to understand is it a BC or PP Fastlane address.
3. `isPayPalFastlaneMethod` => is a method that gets a method id and returns boolean. Should return true if provided methodId is related to PayPal Fastlane.
4. `usePayPalFastlaneAddress` => is a custom hook that contains different paypal connect specific logic like:
   - is PayPal Fastlane enabled;
   - returns merged PayPal and BC addresses;
   - responsible for when to show PayPal Fastlane logo;
   - etc.

## Running unit tests

Run `nx test paypal-fastlane-integration` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint paypal-fastlane-integration` to execute the lint via [ESLint](https://eslint.org/).
