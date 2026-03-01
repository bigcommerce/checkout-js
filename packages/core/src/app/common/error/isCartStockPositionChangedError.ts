import { type CartStockPositionsChangedError } from '@bigcommerce/checkout-sdk';

export default function isCartStockPositionChangedError(error: unknown): error is CartStockPositionsChangedError {
  const requestError = error as CartStockPositionsChangedError;

  return requestError.type === 'cart_stock_positions_changed';
}
