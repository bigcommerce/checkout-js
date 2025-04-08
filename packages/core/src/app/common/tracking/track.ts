import {
  Address,
  Customer as CheckoutCustomer,
  OrderBillingAddress,
} from '@bigcommerce/checkout-sdk';

import countryDialingCodes from '../utility/countryDialingCodes';

declare global {
  interface Window {
    dataLayer: any[];
    _exp: any[];
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
  phone?: Array<number | string>;
  city?: string[];
  state_region?: string[];
  zip_code?: string[];
  country?: string[];
}

function transformPhoneNumber(phone: string | number, countryCode: string): string {
  const removeLeadZeros = (phone: string) => {
    return parseInt(phone, 10).toString();
  };
  // convert to numbers
  const phoneOnlyNumbers = phone.toString().replace(/\D/g, '');

  if (phoneOnlyNumbers === '') return phone.toString();

  // country dialing code
  const dialingCode = countryDialingCodes[countryCode];
  // check if already has country dialing code (if phone starts with + or 00)
  const hasDialingCode =
    phone.toString().startsWith('+') ||
    phone.toString().startsWith('00') ||
    phone.toString().startsWith(dialingCode);
  // prefix
  let prefix = '';

  if (!hasDialingCode) {
    prefix = dialingCode;
  }

  // add prefix (if exists) to phone
  const phoneWithCountryCode = `${prefix.replace(/\D/g, '')}${removeLeadZeros(phoneOnlyNumbers)}`;

  // return
  return removeLeadZeros(phoneWithCountryCode);
}

function transformUserData(user: Customer): GTMUser {
  if (user?.id || user?.customerId) {
    const city: Set<string> = new Set();
    const stateRegion: Set<string> = new Set();
    const zipCode: Set<string> = new Set();
    const country: Set<string> = new Set();
    const phone: Set<string> = new Set();

    if (user.addresses) {
      for (const address of user.addresses) {
        const isUSCountry = address.countryCode === 'US';
        const isUKCountry = address.countryCode === 'GB';

        if (address.city !== '') {
          city.add(address.city.toLowerCase().replace(' ', ''));
        }

        if (address.stateOrProvince !== '') {
          // convert state to ANSI abbreviation code if in US and abbreviation code it exists
          const stateOrProvince = address.stateOrProvince.toLowerCase();
          const stateOrProvinceAbbreviation =
            isUSCountry && address.stateOrProvinceCode.toLowerCase();

          stateRegion.add(stateOrProvinceAbbreviation || stateOrProvince.replace(' ', ''));
        }

        if (address.postalCode !== '') {
          const postalCode = address.postalCode.toLowerCase().replace(' ', '').replace('-', '');
          const firstFiveDigits = postalCode.substring(0, 5);

          zipCode.add(isUSCountry || isUKCountry ? firstFiveDigits : postalCode);
        }

        if (address.countryCode !== '') {
          country.add(address.countryCode.toLowerCase().replace(' ', ''));
        }

        if (address.phone !== '' && address.countryCode !== '') {
          phone.add(transformPhoneNumber(address.phone, address.countryCode));
        }
      }
    }

    return {
      user_id: user.id ?? user.customerId,
      email: user.email,
      is_guest: false,
      phone: Array.from(phone),
      first_name: user.firstName,
      last_name: user.lastName,
      city: Array.from(city),
      state_region: Array.from(stateRegion),
      zip_code: Array.from(zipCode),
      country: Array.from(country),
    };
  }

  const returnData = user?.email ? { is_guest: true, email: user.email } : { is_guest: true };

  return returnData;
}

const transformAddressToGTMUserData = (
  address?: Address,
  email?: string,
  customerId?: number | string,
): GTMUser => {
  const city: Set<string> = new Set();
  const stateRegion: Set<string> = new Set();
  const zipCode: Set<string> = new Set();
  const country: Set<string> = new Set();
  const phone: Set<string> = new Set();

  if (address) {
    const isUSCountry = address.countryCode === 'US';
    const isUKCountry = address.countryCode === 'GB';

    if (address.city !== '') {
      city.add(address.city.toLowerCase().replace(' ', ''));
    }

    if (address.stateOrProvince !== '') {
      // convert state to ANSI abbreviation code if in US and abbreviation code it exists
      const stateOrProvince = address.stateOrProvince.toLowerCase();
      const stateOrProvinceAbbreviation = isUSCountry && address.stateOrProvinceCode.toLowerCase();

      stateRegion.add(stateOrProvinceAbbreviation || stateOrProvince.replace(' ', ''));
    }

    if (address.postalCode !== '') {
      const postalCode = address.postalCode.toLowerCase().replace(' ', '').replace('-', '');
      const firstFiveDigits = postalCode.substring(0, 5);

      zipCode.add(isUSCountry || isUKCountry ? firstFiveDigits : postalCode);
    }

    if (address.countryCode !== '') {
      country.add(address.countryCode.toLowerCase().replace(' ', ''));
    }

    if (address.phone !== '' && address.countryCode !== '') {
      phone.add(transformPhoneNumber(address.phone, address.countryCode));
    }
  }

  return {
    user_id: customerId || undefined, // exists if logged in, otherwise undefined if guest
    email,
    is_guest: !customerId,
    phone: Array.from(phone),
    first_name: address?.firstName,
    last_name: address?.lastName,
    city: Array.from(city),
    state_region: Array.from(stateRegion),
    zip_code: Array.from(zipCode),
    country: Array.from(country),
  };
};

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

interface ItemWithDiscount extends Item {
  discount: number | undefined; // The unit monetary discount value associated with the item
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
  user: GTMUser;
}

export function trackAddShippingInfo(
  info: ShippingData,
  address?: Address,
  email?: string,
  customer?: CheckoutCustomer,
) {
  const userData = transformAddressToGTMUserData(address, email, customer?.id);

  const data: AddShippingInfoData = {
    event: 'add_shipping_info',
    ecommerce: info,
    user: userData,
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
    discount_cart: number | undefined; // The total monetary discount value associated with the cart
    items: ItemWithDiscount[];
  };
}

interface PurchaseData {
  event: string;
  ecommerce: OrderData;
  user: GTMUser;
}

export interface ExpertVoiceData {
  pixelId?: string; // Pixel ID provided by EV
  orderId: string;
  orderDiscountCode: string; // Discount code used on order, or discount group name. Used to identify commissionable orders.
  orderDiscount?: string;
  orderShipping?: string;
  orderSubtotal: string; // Order subtotal. After discount is applied, before tax & shipping. Commission calculated from this.
  orderTax?: string;
  orderCurrency: string;
  orderTotal: string;
  products: Array<{
    id: string; // parent SKU - Should match product code in EV store file
    name: string;
    sku: string;
    upc?: string;
    msrp?: string;
    price: string;
    quantity: string;
  }>;
}

export function trackPurchase(
  info: OrderData,
  address?: Address | OrderBillingAddress,
  customerId?: string | number,
) {
  const userData = transformAddressToGTMUserData(address, (address as any)?.email, customerId);

  const data: PurchaseData = {
    event: 'purchase',
    ecommerce: info,
    user: userData,
  };

  track({ ecommerce: null });
  track(data);
}

interface UserChangeData {
  event: string;
  user: GTMUser;
}

export function trackUserChange(user: Customer) {
  const data: UserChangeData = {
    event: 'logged_in_user_change',
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

export function trackSignUp(location: string, user: Customer) {
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

// EXPERT VOICE TRACKING
export function trackExpertVoice(data: ExpertVoiceData) {
  const _exp = window._exp || [];

  _exp.push({
    ...data,
    pixelId: data.pixelId || 'exp-831-567466', //Pixel ID provided by EV
  });
}
