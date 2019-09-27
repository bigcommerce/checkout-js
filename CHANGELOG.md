# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/bigcommerce/checkout-js/compare/v1.2.1...v1.3.0) (2019-09-27)


### Bug Fixes

* **checkout:** CHECKOUT-2070 Fix print view of order summary page to show product details ([8ec267d](https://github.com/bigcommerce/checkout-js/commit/8ec267d))
* **checkout:** CHECKOUT-4403 INT-1759 Bump `checkout-sdk` version ([2dd3d22](https://github.com/bigcommerce/checkout-js/commit/2dd3d22))
* **common:** CHECKOUT-4418 Fix import path of external ESM modules that are conditionally required ([4fa5c17](https://github.com/bigcommerce/checkout-js/commit/4fa5c17))
* **common:** CHECKOUT-4418 Prefer `main` field over `module` field when resolving packages ([86637f6](https://github.com/bigcommerce/checkout-js/commit/86637f6))
* **payment:** PAYMENTS-4753 Apply validation highlighting to Square V2 form fields ([7b122ef](https://github.com/bigcommerce/checkout-js/commit/7b122ef))


### Features

* **common:** CHECKOUT-4400 Add loader file for loading files listed in manifest ([521a81b](https://github.com/bigcommerce/checkout-js/commit/521a81b))

### [1.2.1](https://github.com/bigcommerce/checkout-js/compare/v1.2.0...v1.2.1) (2019-09-24)


### Bug Fixes

* **cart:** CHECKOUT-4378 Add missing spacing between label and dollar amount ([8c49c69](https://github.com/bigcommerce/checkout-js/commit/8c49c69))

## [1.2.0](https://github.com/bigcommerce/checkout-js/compare/v1.1.3...v1.2.0) (2019-09-24)


### Bug Fixes

* **common:** CHECKOUT-4418 Check whether stack trace exists under exception key rather than at top level ([d9e4e42](https://github.com/bigcommerce/checkout-js/commit/d9e4e42))


### Features

* **common:** CHECKOUT-4378 Add sort-props and one-expression-per-line rules ([990d043](https://github.com/bigcommerce/checkout-js/commit/990d043))
* **common:** CHECKOUT-4422 Use BC eslint-config ([fdb7eac](https://github.com/bigcommerce/checkout-js/commit/fdb7eac))

### [1.1.3](https://github.com/bigcommerce/checkout-js/compare/v1.1.2...v1.1.3) (2019-09-18)


### Bug Fixes

* **checkout:** CHECKOUT-4415 Bump checkout-sdk version ([5a827b9](https://github.com/bigcommerce/checkout-js/commit/5a827b9))
* **common:** CHECKOUT-4418 Fix `instanceof` check not returning true when code is minified ([5f8858f](https://github.com/bigcommerce/checkout-js/commit/5f8858f))
* **common:** CHECKOUT-4418 Log error in console ([5a35293](https://github.com/bigcommerce/checkout-js/commit/5a35293))

### [1.1.2](https://github.com/bigcommerce/checkout-js/compare/v1.1.1...v1.1.2) (2019-09-17)


### Bug Fixes

* **common:** CHECKOUT-4418 Only log exception event if it contains stacktrace ([6ea9938](https://github.com/bigcommerce/checkout-js/commit/6ea9938))
* **common:** CHECKOUT-4418 Only log exception event if it is raised by error ([99d156d](https://github.com/bigcommerce/checkout-js/commit/99d156d))
* **common:** CHECKOUT-4427 CHECKOUT-4418 CHECKOUT-4415 INT-1759 Bump checkout-sdk version ([9e362fb](https://github.com/bigcommerce/checkout-js/commit/9e362fb))


### Code Refactoring

* **payment:** PAYMENTS-4617 Allow to pass different instrument validation components ([6cbef67](https://github.com/bigcommerce/checkout-js/commit/6cbef67))
* **payment:** PAYMENTS-4617 Rename useNewCard to useNewInstrument ([97c9bc4](https://github.com/bigcommerce/checkout-js/commit/97c9bc4))

### [1.1.1](https://github.com/bigcommerce/checkout-js/compare/v1.1.0...v1.1.1) (2019-09-13)


### Bug Fixes

* **cart:** CHECKOUT-4315 Do not strike-through amount without tax ([4f74825](https://github.com/bigcommerce/checkout-js/commit/4f74825))
* **common:** CHECKOUT-4336 Allow empty date custom field when optional ([13f1a98](https://github.com/bigcommerce/checkout-js/commit/13f1a98))
* **common:** CHECKOUT-4336 Allow empty date custom field when optional ([3e2401c](https://github.com/bigcommerce/checkout-js/commit/3e2401c))
* **common:** CHECKOUT-4340 Use local timezone for date ranges ([dc6cac2](https://github.com/bigcommerce/checkout-js/commit/dc6cac2))
* **common:** CHECKOUT-4374 Check out tag before uploading artifacts to Sentry ([53e179b](https://github.com/bigcommerce/checkout-js/commit/53e179b))
* **common:** CHECKOUT-4374 Remove version prefix from Sentry release name ([d7725e1](https://github.com/bigcommerce/checkout-js/commit/d7725e1))
* **common:** CHECKOUT-4409 Configure public path before rendering apps ([24504f6](https://github.com/bigcommerce/checkout-js/commit/24504f6))
* **common:** CHECKOUT-4412 Display fallback component if unable to lazy load chunk ([0cb677f](https://github.com/bigcommerce/checkout-js/commit/0cb677f))
* **common:** CHECKOUT-4412 Retry if unable to load asset chunk ([f253041](https://github.com/bigcommerce/checkout-js/commit/f253041))
* **common:** CHECKOUT-4418 Rewrite filename of error frames before sending to Sentry ([ff05b2e](https://github.com/bigcommerce/checkout-js/commit/ff05b2e))
* **order:** CHECKOUT-4393 Bump SDK to fix order resubmission. ([decc29a](https://github.com/bigcommerce/checkout-js/commit/decc29a))
* **payment:** CHECKOUT-4357 Redirect to PayPal when location header ([315fcca](https://github.com/bigcommerce/checkout-js/commit/315fcca))
* **payment:** CHECKOUT-4398 Prevent default when sign in to visa ([ae21ef5](https://github.com/bigcommerce/checkout-js/commit/ae21ef5))
* **payments:** INT-1892 Do not prompt when been redirected to 3DS1 using Converge ([d984fce](https://github.com/bigcommerce/checkout-js/commit/d984fce))

## [1.1.0](https://github.com/bigcommerce/checkout-js/compare/v1.0.2...v1.1.0) (2019-09-09)


### Bug Fixes

* **common:** CHECKOUT-4364 Upgrade checkout-sdk version to v1.34.2 ([81303ea](https://github.com/bigcommerce/checkout-js/commit/81303ea))
* **common:** CHECKOUT-4374 Output polyfill as separate chunk ([3cc12ea](https://github.com/bigcommerce/checkout-js/commit/3cc12ea))
* **common:** CHECKOUT-4374 Pass public path from host page ([6608bf0](https://github.com/bigcommerce/checkout-js/commit/6608bf0))
* **embedded-checkout:** CHECKOUT-4388 Upgrade checkout-sdk version to v1.34.3 ([cac71db](https://github.com/bigcommerce/checkout-js/commit/cac71db))
* **payment:** CHECKOUT-4384 Fix payment form not hiding previous validation result when switching to new payment method ([1c5691f](https://github.com/bigcommerce/checkout-js/commit/1c5691f))
* **payment:** CHECKOUT-4384 Reset payment form before mounting new payment method component ([03aa684](https://github.com/bigcommerce/checkout-js/commit/03aa684))


### Code Refactoring

* **common:** CHECKOUT-4272 Use bigcommerce/memoize package ([337b719](https://github.com/bigcommerce/checkout-js/commit/337b719))
* **payment:** CHECKOUT-4272 Use nested component instead of memoize ([a95cc2d](https://github.com/bigcommerce/checkout-js/commit/a95cc2d))


### Features

* **common:** CHECKOUT-4364 Upgrade Sentry client ([c20985c](https://github.com/bigcommerce/checkout-js/commit/c20985c))

### [1.0.2](https://github.com/bigcommerce/checkout-js/compare/v1.0.1...v1.0.2) (2019-08-28)


### Bug Fixes

* **cart:** CHECKOUT-4272 Fix spacing issue in cart summary panel ([51be22b](https://github.com/bigcommerce/checkout-js/commit/51be22b))
* **checkout:** INT-1829 INT-1836 CHECKOUT-4272 Bump checkout-sdk version to v1.34.1 ([4c8f395](https://github.com/bigcommerce/checkout-js/commit/4c8f395))
* **payment:** INT-1831 widget is now loaded when vaulted instruments exists ([69ba28c](https://github.com/bigcommerce/checkout-js/commit/69ba28c))


### Code Refactoring

* **common:** CHECKOUT-4272 Add ability to pass mapper factory to injector HOC so it is possible to call memoized function inside mapper for each component instance ([cfc7a8f](https://github.com/bigcommerce/checkout-js/commit/cfc7a8f))
* **common:** CHECKOUT-4352 Turn on `react/jsx-no-bind` rule ([ae10fdb](https://github.com/bigcommerce/checkout-js/commit/ae10fdb))


### Performance Improvements

* **billing:** CHECKOUT-4272 Check if props are different before calling render method of billing components ([dcb3965](https://github.com/bigcommerce/checkout-js/commit/dcb3965))
* **billing:** CHECKOUT-4272 Stop passing arrow functions into components in billing address components ([6658efe](https://github.com/bigcommerce/checkout-js/commit/6658efe))
* **billing:** CHECKOUT-4352 Optimize rendering of static address ([5ecdd35](https://github.com/bigcommerce/checkout-js/commit/5ecdd35))
* **cart:** CHECKOUT-4272 Avoid passing arrow function to cart components ([0036c08](https://github.com/bigcommerce/checkout-js/commit/0036c08))
* **cart:** CHECKOUT-4272 Check if props are different before calling render method of cart components ([d396b54](https://github.com/bigcommerce/checkout-js/commit/d396b54))
* **checkout:** CHECKOUT-4272 Avoid passing arrow function to checkout components ([6e037c0](https://github.com/bigcommerce/checkout-js/commit/6e037c0))
* **checkout:** CHECKOUT-4272 Check if props are different before calling render method of cart components ([587ed2a](https://github.com/bigcommerce/checkout-js/commit/587ed2a))
* **customer:** CHECKOUT-4272 Check if props are different before calling render method of customer components ([01e2ad7](https://github.com/bigcommerce/checkout-js/commit/01e2ad7))
* **customer:** CHECKOUT-4272 Stop passing arrow functions into components in customer section ([caf3a83](https://github.com/bigcommerce/checkout-js/commit/caf3a83))
* **order:** CHECKOUT-4272 Check if props are different before calling render method of order components ([534da6f](https://github.com/bigcommerce/checkout-js/commit/534da6f))
* **order:** CHECKOUT-4272 Stop passing arrow functions into components on order confirmation page ([76e7ea3](https://github.com/bigcommerce/checkout-js/commit/76e7ea3))
* **payment:** CHECKOUT-4272 Avoid passing arrow function to credit card fields ([787bfd3](https://github.com/bigcommerce/checkout-js/commit/787bfd3))
* **payment:** CHECKOUT-4272 Avoid passing arrow function to instrument fields ([33ee337](https://github.com/bigcommerce/checkout-js/commit/33ee337))
* **payment:** CHECKOUT-4272 Avoid passing arrow function to terms and condition field ([e455c06](https://github.com/bigcommerce/checkout-js/commit/e455c06))
* **payment:** CHECKOUT-4272 Avoid re-rendering list of payment methods unless there are relevant changes ([624fe81](https://github.com/bigcommerce/checkout-js/commit/624fe81))
* **payment:** CHECKOUT-4272 Avoid re-rendering payment method component unless there are relevant changes ([74803ff](https://github.com/bigcommerce/checkout-js/commit/74803ff))
* **payment:** CHECKOUT-4272 Check if props are different before calling render method of payment components ([e656647](https://github.com/bigcommerce/checkout-js/commit/e656647))
* **payment:** CHECKOUT-4272 Stop passing initialisation state to submit button of payment form ([39a83ec](https://github.com/bigcommerce/checkout-js/commit/39a83ec))
* **shipping:** CHECKOUT-4272 Check if props are different before calling render method of shipping components ([2af27c8](https://github.com/bigcommerce/checkout-js/commit/2af27c8))
* **shipping:** CHECKOUT-4272 Stop passing arrow functions into components in shipping components ([4d163d9](https://github.com/bigcommerce/checkout-js/commit/4d163d9))

### [1.0.1](https://github.com/bigcommerce/checkout-js/compare/v1.0.0...v1.0.1) (2019-08-23)


### Bug Fixes

* **billing:** CHECKOUT-4352 Display special message in billing section when using Amazon Pay ([424b9c0](https://github.com/bigcommerce/checkout-js/commit/424b9c0))
* **billing:** CHECKOUT-4352 Fix billing address not displaying properly when it is partially complete ([7ac4b42](https://github.com/bigcommerce/checkout-js/commit/7ac4b42))
* **billing:** CHECKOUT-4352 Keep the loading spinner spinning when updating order comment and billing address ([f1f161e](https://github.com/bigcommerce/checkout-js/commit/f1f161e))
* **checkout:** CHECKOUT-4344 Fix checkout steps not collapsing in mobile view ([a81a67a](https://github.com/bigcommerce/checkout-js/commit/a81a67a))
* **payment:** INT-1837 Fix conflicting styles injected by Klarna causing modal to be cropped in Firefox ([4b4b1fc](https://github.com/bigcommerce/checkout-js/commit/4b4b1fc))


### Code Refactoring

* **checkout:** CHECKOUT-4338 Use media query component to conditionally render checkout step ([d352673](https://github.com/bigcommerce/checkout-js/commit/d352673))
* **checkout:** CHECKOUT-4344 Remove temporary code required for transition period ([99388b3](https://github.com/bigcommerce/checkout-js/commit/99388b3))
* **common:** CHECKOUT-4338 Fix circular dependencies of ES modules ([e28f98d](https://github.com/bigcommerce/checkout-js/commit/e28f98d))
* **common:** CHECKOUT-4338 Include hash in file name so we can determine public path for IE11 more reliably ([e5a9c57](https://github.com/bigcommerce/checkout-js/commit/e5a9c57))
* **common:** CHECKOUT-4338 Move `BuildHooks` Webpack plugin to `scripts` folder ([54de46c](https://github.com/bigcommerce/checkout-js/commit/54de46c))
* **common:** CHECKOUT-4338 Re-enable modules concatenation ([1b79f2b](https://github.com/bigcommerce/checkout-js/commit/1b79f2b))
* **common:** CHECKOUT-4338 Stop importing internal modules ([ef9d34c](https://github.com/bigcommerce/checkout-js/commit/ef9d34c))
* **common:** CHECKOUT-4338 Use ESLint to help fix import / export issues ([a27769e](https://github.com/bigcommerce/checkout-js/commit/a27769e))
* **common:** CHECKOUT-4351 Enable React-specific ESLint rules ([ce56dd1](https://github.com/bigcommerce/checkout-js/commit/ce56dd1))


### Performance Improvements

* **billing:** CHECKOUT-4352 Optimize rendering of static address ([dab9d1c](https://github.com/bigcommerce/checkout-js/commit/dab9d1c))
* **checkout:** CHECKOUT-4338 Lazy load checkout steps using dynamic imports ([42522ab](https://github.com/bigcommerce/checkout-js/commit/42522ab))
* **checkout:** CHECKOUT-4338 Only load cart and order summary drawer when in mobile view ([35a0560](https://github.com/bigcommerce/checkout-js/commit/35a0560))

## 1.0.0 (2019-08-14)


### Bug Fixes

* **checkout:** CHECKOUT-4321 Bump checkout-sdk version to v1.32.1 ([2737c71](https://github.com/bigcommerce/checkout-js/commit/2737c71))
* **common:** CHECKOUT-4307 Include polyfills for 3rd party dependencies ([7e103d6](https://github.com/bigcommerce/checkout-js/commit/7e103d6))


### Features

* **billing:** CHECKOUT-4223 Add Billing components ([f55addd](https://github.com/bigcommerce/checkout-js/commit/f55addd))
* **cart:** CHECKOUT-4223 Add Cart summary component ([46fbca2](https://github.com/bigcommerce/checkout-js/commit/46fbca2))
* **cart:** CHECKOUT-4223 Add coupon component ([748898e](https://github.com/bigcommerce/checkout-js/commit/748898e))
* **checkout:** CHECKOUT-4223 Add `CheckoutSupport` interface, to be implemented by classes used to check if feature is supported by certain type of checkout ([8115957](https://github.com/bigcommerce/checkout-js/commit/8115957))
* **checkout:** CHECKOUT-4223 Add `withCheckout` HOC for connecting to `CheckoutContext` ([e2b10d5](https://github.com/bigcommerce/checkout-js/commit/e2b10d5))
* **checkout:** CHECKOUT-4223 Add checkout component ([44b8944](https://github.com/bigcommerce/checkout-js/commit/44b8944))
* **checkout:** CHECKOUT-4223 Add checkout steps ([15cecb5](https://github.com/bigcommerce/checkout-js/commit/15cecb5))
* **checkout:** CHECKOUT-4223 Add component for providing checkout context ([8adfae9](https://github.com/bigcommerce/checkout-js/commit/8adfae9))
* **checkout:** CHECKOUT-4223 Add component for rendering list of promotion banners ([8256063](https://github.com/bigcommerce/checkout-js/commit/8256063))
* **checkout:** INT-1608 INT-1811 Bump `checkout-sdk` version ([cdf6fd7](https://github.com/bigcommerce/checkout-js/commit/cdf6fd7))
* **common:** CHECKOUT-4223 Add address components ([fd6ad47](https://github.com/bigcommerce/checkout-js/commit/fd6ad47))
* **common:** CHECKOUT-4223 Add AddressForm ([5091c13](https://github.com/bigcommerce/checkout-js/commit/5091c13))
* **common:** CHECKOUT-4223 Add analytics module ([e00ee0a](https://github.com/bigcommerce/checkout-js/commit/e00ee0a))
* **common:** CHECKOUT-4223 Add base class for creating custom error objects ([cc06eff](https://github.com/bigcommerce/checkout-js/commit/cc06eff))
* **common:** CHECKOUT-4223 Add component for retrieving translated text from locale context ([d84403d](https://github.com/bigcommerce/checkout-js/commit/d84403d))
* **common:** CHECKOUT-4223 Add config mock ([bf0f1b5](https://github.com/bigcommerce/checkout-js/commit/bf0f1b5))
* **common:** CHECKOUT-4223 Add currency UI components ([330cfcb](https://github.com/bigcommerce/checkout-js/commit/330cfcb))
* **common:** CHECKOUT-4223 Add DOM module ([bc0f58e](https://github.com/bigcommerce/checkout-js/commit/bc0f58e))
* **common:** CHECKOUT-4223 Add empty array and object ([3e07d7a](https://github.com/bigcommerce/checkout-js/commit/3e07d7a))
* **common:** CHECKOUT-4223 Add Error logger ([83947ec](https://github.com/bigcommerce/checkout-js/commit/83947ec))
* **common:** CHECKOUT-4223 Add ErrorModal component ([58a2bdf](https://github.com/bigcommerce/checkout-js/commit/58a2bdf))
* **common:** CHECKOUT-4223 Add foundational UI components ([a97d8bc](https://github.com/bigcommerce/checkout-js/commit/a97d8bc))
* **common:** CHECKOUT-4223 Add geography mocks ([8fed0f8](https://github.com/bigcommerce/checkout-js/commit/8fed0f8))
* **common:** CHECKOUT-4223 Add GoogleAddressAutocomplete component ([931ba93](https://github.com/bigcommerce/checkout-js/commit/931ba93))
* **common:** CHECKOUT-4223 Add GoogleAddressAutocomplete component ([49633b2](https://github.com/bigcommerce/checkout-js/commit/49633b2))
* **common:** CHECKOUT-4223 Add HOC factories ([5bd3c89](https://github.com/bigcommerce/checkout-js/commit/5bd3c89))
* **common:** CHECKOUT-4223 Add i18n ([20c4787](https://github.com/bigcommerce/checkout-js/commit/20c4787))
* **common:** CHECKOUT-4223 Add images and SVGs ([ba0e9cf](https://github.com/bigcommerce/checkout-js/commit/ba0e9cf))
* **common:** CHECKOUT-4223 Add locale context provider ([9511bcd](https://github.com/bigcommerce/checkout-js/commit/9511bcd))
* **common:** CHECKOUT-4223 Add memoize function for caching results of pure functions ([322ca72](https://github.com/bigcommerce/checkout-js/commit/322ca72))
* **common:** CHECKOUT-4223 Add polyfills ([109cb24](https://github.com/bigcommerce/checkout-js/commit/109cb24))
* **common:** CHECKOUT-4223 Move existing stylesheets over ([5a8ad74](https://github.com/bigcommerce/checkout-js/commit/5a8ad74))
* **customer:** CHECKOUT-4223 Add customer information component ([f0fe892](https://github.com/bigcommerce/checkout-js/commit/f0fe892))
* **customer:** CHECKOUT-4223 Add customer step component ([70cb6c6](https://github.com/bigcommerce/checkout-js/commit/70cb6c6))
* **customer:** CHECKOUT-4223 Add guest customer form ([b6b9e26](https://github.com/bigcommerce/checkout-js/commit/b6b9e26))
* **customer:** CHECKOUT-4223 Add GuestSignup component ([cf5f37d](https://github.com/bigcommerce/checkout-js/commit/cf5f37d))
* **customer:** CHECKOUT-4223 Add returning customer form ([1767ec7](https://github.com/bigcommerce/checkout-js/commit/1767ec7))
* **embedded-checkout:** CHECKOUT-4223 Add support for Embedded Checkout ([a5b6cf8](https://github.com/bigcommerce/checkout-js/commit/a5b6cf8))
* **order:** CHECKOUT-4223 Add order confirmation page ([8194118](https://github.com/bigcommerce/checkout-js/commit/8194118))
* **order:** CHECKOUT-4223 Add OrderComments component ([63a7a78](https://github.com/bigcommerce/checkout-js/commit/63a7a78))
* **payment:** CHECKOUT-4223 Add common payment form fields ([f21f9eb](https://github.com/bigcommerce/checkout-js/commit/f21f9eb))
* **payment:** CHECKOUT-4223 Add credit card payment form ([b7807fa](https://github.com/bigcommerce/checkout-js/commit/b7807fa))
* **payment:** CHECKOUT-4223 Add dropdown for selecting stored payment instrument ([6fcc576](https://github.com/bigcommerce/checkout-js/commit/6fcc576))
* **payment:** CHECKOUT-4223 Add generic payment method components ([6a882c5](https://github.com/bigcommerce/checkout-js/commit/6a882c5))
* **payment:** CHECKOUT-4223 Add GiftCertificate components ([35d3214](https://github.com/bigcommerce/checkout-js/commit/35d3214))
* **payment:** CHECKOUT-4223 Add instrument fieldset, to be used inside credit card payment form ([8fd3370](https://github.com/bigcommerce/checkout-js/commit/8fd3370))
* **payment:** CHECKOUT-4223 Add modal UI for managing stored instruments ([79f1bdc](https://github.com/bigcommerce/checkout-js/commit/79f1bdc))
* **payment:** CHECKOUT-4223 Add payment form component ([34fd528](https://github.com/bigcommerce/checkout-js/commit/34fd528))
* **payment:** CHECKOUT-4223 Add provider-specific payment method components ([8672952](https://github.com/bigcommerce/checkout-js/commit/8672952))
* **shipping:** CHECKOUT-4223 Add function for determining whether shopper is using multi-shipping ([fed94b3](https://github.com/bigcommerce/checkout-js/commit/fed94b3))
* **shipping:** CHECKOUT-4223 Add Shipping form ([601a939](https://github.com/bigcommerce/checkout-js/commit/601a939))
* **shipping:** CHECKOUT-4223 Add shipping util functions ([ef1655e](https://github.com/bigcommerce/checkout-js/commit/ef1655e))
