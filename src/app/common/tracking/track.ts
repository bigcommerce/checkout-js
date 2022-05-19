declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function track(data: any) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

interface AddCouponData {
  event: string;
  ecommerce: {
    coupon: string;
    discount: number;
  };
}

export function trackAddCoupon(coupon: string, discount: number) {
  const data: AddCouponData = {
    event: 'add_coupon',
    ecommerce: { coupon, discount },
  };
  track({ ecommerce: null });
  track(data);
}

interface Item {
  item_name: string;
  item_id?: number | string;
  item_variant?: string;
  currency?: string;
  index?: number;
  item_brand?: string;
  item_list_id?: number;
  item_list_name?: string;
  price: number;
  quantity: number;
}

export interface ShippingData {
  currency?: string;
  value?: string | number;
  shipping_tier?: string;
  coupons: Array<{
    coupon: string;
    discount: number;
  }>;
  items: Item[];
}

interface AddShippingInfoData {
  event: string;
  ecommerce: ShippingData;
}

export function trackAddShippingInfo(info: ShippingData) {
  const data: AddShippingInfoData = {
    event: 'add_shipping_info',
    ecommerce: info,
  };
  track({ ecommerce: null });
  track(data);
}

interface CheckoutProgressData {
  event: string;
  event_info: {
    form_name: string;
    form_step_name: string;
  };
}

export function trackCheckoutProgress(stepName: string) {
  const data: CheckoutProgressData = {
    event: 'checkout_progress',
    event_info: {
      form_name: 'checkout',
      form_step_name: stepName,
    },
  };
  track(data);
}

export interface OrderData {
  purchase: {
    transaction_id: string | number;
    affiliation: string | undefined;
    value: number | undefined;
    tax: number | undefined;
    shipping: number | string | undefined;
    currency: string | undefined;
    coupons: Array<{
      coupon: string;
      discount: number;
    }>;
    items: Item[];
  };
}
interface PurchaseData {
  event: string;
  ecommerce: OrderData;
}

export function trackPurchase(info: OrderData) {
  const data: PurchaseData = {
    event: 'purchase',
    ecommerce: info,
  };
  track({ ecommerce: null });
  track(data);
}

interface LoginData {
  event: string;
  user: {
    user_id: number | undefined;
    email: string | undefined;
  };
}

export function trackLoginData(userId: number | undefined, userEmail: string | undefined) {
  const data: LoginData = {
    event: 'login',
    user: {
      user_id: userId,
      email: userEmail,
    },
  };
  track(data);
}

interface SignUpData {
  event: string;
  event_info: {
    form_name: string;
    sign_up_location: string;
  };
  user: {
    user_id: number | undefined;
    email: string | undefined;
  };
}

export function trackSignUp(location: string, userId: number | undefined, userEmail: string | undefined) {
  const data: SignUpData = {
    event: 'sign_up',
    event_info: {
      form_name: 'create_account',
      sign_up_location: location,
    },
    user: {
      user_id: userId,
      email: userEmail,
    },
  };
  track(data);
}
