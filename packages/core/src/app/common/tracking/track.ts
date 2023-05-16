import stateAbbreviations from "../utility/stateAbbreviations";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface Customer {
  id?: number;
  customerId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  addresses?: any[];
}

interface GTMUser {
  user_id?: number | string;
  is_guest: boolean | string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: number | string;
  city?: string[];
  state_region?: string[];
  zip_code?: string[];
  country?: string[];
}

function transformUserData(user: Customer): GTMUser {
  if (user?.id || user?.customerId) {
    const city: Set<string> = new Set();
    const stateRegion: Set<string> = new Set();
    const zipCode: Set<string> = new Set();
    const country: Set<string> = new Set();

    if (user.addresses) {
      for (const address of user.addresses) {
        const isUSCountry = address.countryCode === 'US';

        if (address.city !== '') {
          city.add(address.city.toLowerCase().replace(" ", ""));
        }

        if (address.stateOrProvince !== '') {
          // convert state to ANSI abbreviation code if in US and abbreviation code it exists
          const stateOrProvince = address.stateOrProvince.toLowerCase()
          const stateOrProvinceAbbreviation = isUSCountry && stateAbbreviations[stateOrProvince]

          stateRegion.add(stateOrProvinceAbbreviation || stateOrProvince.replace(" ", ""));
        }

        if (address.postalCode !== '') {
          const postalCode = address.postalCode.toLowerCase().replace(" ", "").replace("-","")
          const firstFiveDigits = postalCode.substring(0, 5);

          zipCode.add(isUSCountry ? firstFiveDigits : postalCode);
        }
        
        if (address.countryCode !== '') {
          country.add(address.countryCode.toLowerCase().replace(" ", ""));
        }
      }
    }

    return {
      user_id: user.id ?? user.customerId,
      email: user.email,
      is_guest: false,
      phone: user.phoneNumber || user.addresses?.[0]?.phone,
      first_name: user.firstName,
      last_name: user.lastName,
      city: Array.from(city),
      state_region: Array.from(stateRegion),
      zip_code: Array.from(zipCode),
      country: Array.from(country),
    };
  } else {
    const returnData = user?.email ? { is_guest: true, email: user.email } : { is_guest: true };

    return returnData;
  }
}

export function track(data: any) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

export interface CouponData {
  coupon: string;
  discount: number;
}

export interface PromotionData {
  id?: string | number;
  discount: number;
}

interface AddCouponData {
  event: string;
  ecommerce: CouponData;
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
  coupons: CouponData[];
  promotions: PromotionData[];
}

export interface ShippingData {
  currency?: string;
  value?: string | number;
  shipping_tier?: string;
  coupons: CouponData[];
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
    coupons: CouponData[];
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

interface DetailedUserData {
  user: GTMUser;
}

export function trackDetailedUserData(user: Customer) {
  const data: DetailedUserData = {
    user: transformUserData(user),
  };

  track(data);
}

interface LoginData {
  event: string;
  user: GTMUser;
}

export function trackLogin(user: Customer) {
  const data: LoginData = {
    event: 'login',
    user: transformUserData(user),
  };

  track(data);
}

export function trackGuest(email: string) {
  const data = { event: 'guest_purchase', user: { email } };

  track(data);
}

interface SignUpData {
  event: string;
  event_info: {
    form_name: string;
    sign_up_location: string;
  };
  user: GTMUser;
}

export function trackSignUp(
  location: string,
  user: Customer
) {
  const data: SignUpData = {
    event: 'sign_up',
    event_info: {
      form_name: 'create_account',
      sign_up_location: location,
    },
    user: transformUserData(user),
  };

  track(data);
}
