interface Document {
  readonly prerendering: boolean;
}

interface Window {
  checkoutRefreshAPI?: import('../src/app/checkout/prerenderingStalenessDetector').CheckoutRefreshAPI;
}
