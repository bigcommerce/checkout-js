# paypal-connect-integration

This library contains useful methods related to form fields.
1. `PoweredByPaypalConnectLabel` => a component that renders PayPal Connect logo.
2. `isPayPalConnectAddress` => is a method that helps to understand is it a BC or PP Connect address.
3. `isPaypalConnectMethod` => is a method that gets a method id and returns boolean. Should return true if provided methodId is related to PayPal Connect.
4. `usePayPalConnectAddress` => is a custom hook that contains different paypal connect specific logic like:
   - is PayPal axo enabled;
   - returns merged PayPal and BC addresses;
   - responsible for when to show PayPal Connect logo;
   - etc.

## Running unit tests

Run `nx test paypal-connect-integration` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint paypal-connect-integration` to execute the lint via [ESLint](https://eslint.org/).
