# legacy-hoc

This library consists of following tools that can create higher order components.
1. `createInjectHoc` => This creates a HOC that accepts the context and returns the new component with the values from the context. It also accept prop to pick specific keys from the context and pass only those properties to the returned component.
2. `createMappableInjectHoc` => This is similar to `createInjectHoc` just that it adds the ability to map different values from context to some other property.

## Running unit tests

Run `nx test legacy-hoc` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint legacy-hoc` to execute the lint via [ESLint](https://eslint.org/).
