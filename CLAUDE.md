# checkout-js — project conventions

## Exports

**Always use named exports. Never add new default exports.**

Much of the existing codebase uses default exports — do NOT copy that pattern.
It is legacy; the team has standardized on named exports for all new code.

```ts
// ✅ Correct
export const CustomerInfo = () => { ... };
export { CustomerInfo } from './CustomerInfo';

// ❌ Wrong — do not do this, even though existing files do
export default CustomerInfo;
```

- New files: named exports only, including React components.
- When editing an existing file that has a default export, leave the existing
  export as-is unless the task is specifically to refactor it — but any new
  symbol you export must be a named export.
- Barrel files (`index.ts`): re-export by name (`export { X } from './X'`),
  not `export { default as X }` for new modules.

## useCheckout

**Avoid bare `useCheckout()`.** Calling it with no selector subscribes the
component to the entire checkout state, so it re-renders on every state change.
Always pass a selector, or a no-op selector if you don't need reactive state.

```ts
// ✅ Need state — pass a selector returning an object, and destructure
// `selectedState` inline so values are ready to use directly
const {
    selectedState: {
        config,
        checkout,
        order,
    },
} = useCheckout(({ data }) => ({
    config: data.getConfig(),
    checkout: data.getCheckout(),
    order: data.getOrder(),
}));

// ✅ No-op selector — only for two cases where subscribing adds nothing:
//    1. Calling service methods only (checkoutService, errorLogger).
//    2. Reading state once on mount for initial local state (see useLoadCheckout).
// NOT an escape hatch: if the component renders from checkout state, use a real selector
const { checkoutService } = useCheckout(() => undefined);

// ❌ Wrong — bare call subscribes to ALL state changes
const { checkoutState } = useCheckout();
```
