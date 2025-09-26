# Prerendering Staleness Detection

This document describes the implementation of staleness detection for prerendered checkout pages.

## Overview

When using prerendering with Speculation Rules, checkout pages may become stale if the cart state changes after prerendering but before the user navigates to the checkout. This implementation automatically detects and refreshes stale checkout data without causing jank for users.

## Implementation

### Core Components

1. **PrerenderingStalenessDetector**: Captures and compares checkout snapshots
2. **Prerendering Change Handler**: Handles the `prerenderingchange` event
3. **Global Refresh API**: Exposed on `window.checkoutRefreshAPI` for external use

### Detection Strategy

The system uses a simple and efficient version-based approach to detect staleness:

- **Checkout ID**: Unique identifier for the checkout session
- **Version Number**: Integer version field from the `/api/storefront/checkouts/[id]` API response that increments whenever cart contents, totals, or other checkout data changes

This approach is much simpler and more reliable than comparing multiple individual fields, as the version number automatically captures any meaningful change to the checkout state.

### Usage

#### Automatic Detection (Built-in)

The implementation automatically:

1. Captures initial snapshot when a page is prerendered
2. Listens for the `prerenderingchange` event
3. Refreshes checkout data in the background if changes are detected
4. Logs when refresh occurs due to staleness

#### Manual Refresh API

The global API is available at `window.checkoutRefreshAPI`:

```typescript
// Check if checkout data is stale
const isStale = window.checkoutRefreshAPI?.isCheckoutStale();

// Force refresh checkout data
const result = await window.checkoutRefreshAPI?.refreshCheckout(true);
console.log('Refresh success:', result.success, 'Was stale:', result.wasStale);

// Get current snapshot for debugging
const snapshot = window.checkoutRefreshAPI?.getCurrentSnapshot();
console.log('Current checkout state:', snapshot);
// Example output: { checkoutId: "abc123", version: 2, timestamp: 1234567890 }
```

#### External Integration Examples

```javascript
// Example: Refresh when cart is modified in another tab
window.addEventListener('storage', async (e) => {
  if (e.key === 'cart_modified') {
    const result = await window.checkoutRefreshAPI?.refreshCheckout();
    if (result?.wasStale) {
      console.log('Checkout was refreshed due to cart changes');
    }
  }
});

// Example: Periodic staleness check
setInterval(async () => {
  if (window.checkoutRefreshAPI?.isCheckoutStale()) {
    await window.checkoutRefreshAPI.refreshCheckout();
  }
}, 30000); // Check every 30 seconds
```

## Files Modified

- `packages/core/src/app/checkout/prerenderingStalenessDetector.ts` - Core implementation with version-based detection
- `packages/core/src/app/checkout/CheckoutPage.tsx` - Integration with checkout page
- `packages/core/types/dom.extended.d.ts` - Type definitions for global API
- `packages/**/src/**/*.mock.ts` - Updated checkout mocks to include version property
- `webpack.config.js` - Fixed MANIFEST_JSON race condition for development mode

## Benefits

1. **Seamless UX**: No jank when checkout data hasn't changed
2. **Automatic Updates**: Stale data is refreshed transparently using version-based detection
3. **Efficient Detection**: Simple integer comparison (version numbers) instead of complex field-by-field comparison
4. **External API**: Allows custom refresh triggers from external code
5. **Debugging Support**: Comprehensive logging and inspection capabilities
6. **Type Safety**: Full TypeScript support with module augmentation for the version field

## Edge Cases Handled

- Missing cart/checkout data
- Network failures during refresh (graceful degradation)
- Multiple rapid refresh attempts
- Component unmounting during refresh
- API cleanup on page navigation

## Testing

Comprehensive test coverage includes:
- Staleness detection accuracy
- Error handling
- API functionality
- Integration with existing prerendering flow

Run tests with:
```bash
npx nx run core:test --testPathPattern=prerenderingStalenessDetector
```

All tests focus on version-based detection logic and API functionality. The test suite includes 18 tests covering the detector class, event handling, and global API methods.