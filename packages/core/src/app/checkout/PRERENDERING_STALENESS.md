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

The system compares these key identifiers to detect staleness:

- Cart ID
- Cart updated time
- Cart item count (physical + digital + gift certificates)
- Cart base amount  
- Checkout ID
- Number of consignments

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

- `packages/core/src/app/checkout/prerenderingStalenessDetector.ts` - Core implementation
- `packages/core/src/app/checkout/CheckoutPage.tsx` - Integration with checkout page
- `packages/core/types/dom.extended.d.ts` - Type definitions for global API

## Benefits

1. **Seamless UX**: No jank when checkout data hasn't changed
2. **Automatic Updates**: Stale data is refreshed transparently
3. **External API**: Allows custom refresh triggers from external code
4. **Debugging Support**: Comprehensive logging and inspection capabilities

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
npx jest packages/core/src/app/checkout/prerenderingStalenessDetector.test.ts --config=packages/core/jest.config.js
```