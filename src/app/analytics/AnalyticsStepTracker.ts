import { Checkout, CheckoutService, Coupon, LineItemMap, Order, ShippingOption, ShopperCurrency, StoreProfile } from '@bigcommerce/checkout-sdk';

import StepTracker from './StepTracker';

export const ORDER_ITEMS_STORAGE_KEY = 'ORDER_ITEMS';

export enum ANALYTIC_STEP_TYPE {
    CUSTOMER = 1,
    SHIPPING,
    BILLING,
    PAYMENT,
}

export const ANALYTIC_STEPS: { [key: string]: ANALYTIC_STEP_TYPE } = {
    customer: ANALYTIC_STEP_TYPE.CUSTOMER,
    shipping: ANALYTIC_STEP_TYPE.SHIPPING,
    billing: ANALYTIC_STEP_TYPE.BILLING,
    payment: ANALYTIC_STEP_TYPE.PAYMENT,
};

export const ANALYTIC_STEP_ORDER = [
    ANALYTIC_STEPS.customer,
    ANALYTIC_STEPS.shipping,
    ANALYTIC_STEPS.billing,
    ANALYTIC_STEPS.payment,
];

export default class AnalyticsStepTracker implements StepTracker {
    private checkoutStarted: boolean = false;
    private completedSteps: { [key: string]: boolean } = {};
    private viewedSteps: { [key in ANALYTIC_STEP_TYPE]?: boolean; } = {};

    constructor(
        private checkoutService: CheckoutService,
        private storage: StorageFallback,
        private legacyStorage: Storage,
        private analytics: AnalyticsTracker
    ) {}

    trackCheckoutStarted(): void {
        if (this.checkoutStarted) {
            return;
        }

        const checkout = this.getCheckout();

        if (!checkout) {
            return;
        }

        const {
            coupons,
            grandTotal,
            shippingCostTotal,
            taxTotal,
            cart: {
                lineItems,
                discountAmount,
                id,
            },
        } = checkout;

        const extraItemsData = this.saveExtraItemsData(id, lineItems);

        this.analytics.track('Checkout Started', this.getTrackingPayload({
            revenue: grandTotal,
            shipping: shippingCostTotal,
            tax: taxTotal,
            discount: discountAmount,
            coupons,
            lineItems,
            extraItemsData,
        }));

        this.checkoutStarted = true;
    }

    trackOrderComplete(): void {
        const order = this.getOrder();

        if (!order) {
            return;
        }

        const {
            isComplete,
            orderId,
            orderAmount,
            shippingCostTotal,
            taxTotal,
            discountAmount,
            coupons,
            lineItems,
            cartId,
        } = order;

        if (!isComplete) {
            return;
        }

        const extraItemsData = this.readExtraItemsData(cartId);

        if (extraItemsData === null) {
            return;
        }

        this.analytics.track('Order Completed', this.getTrackingPayload({
            orderId,
            revenue: orderAmount,
            shipping: shippingCostTotal,
            tax: taxTotal,
            discount: discountAmount,
            coupons,
            extraItemsData,
            lineItems,
        }));

        this.clearExtraItemData(cartId);
    }

    trackStepViewed(step: string): void {
        const stepId = this.getIdFromStep(step);

        if (!stepId || this.hasStepViewed(stepId)) {
            return;
        }

        this.trackViewed(stepId);
        this.backfill(stepId);
    }

    trackStepCompleted(step: string): void {
        const stepId = this.getIdFromStep(step);

        if (!stepId || this.hasStepCompleted(stepId)) {
            return;
        }

        this.backfill(stepId);
        this.trackCompleted(stepId);
    }

    private trackCompleted(stepId: ANALYTIC_STEP_TYPE): void {
        const shippingMethod = this.getSelectedShippingOption();
        const { code: currency = '' } = this.getShopperCurrency() || {};
        const paymentMethod = this.getPaymentMethodName();

        const payload: {
            step: number;
            currency: string;
            shippingMethod?: string;
            paymentMethod?: string;
        } = {
            step: stepId,
            currency,
        };

        if (shippingMethod) {
            payload.shippingMethod = shippingMethod.description;
        }

        if (paymentMethod) {
            payload.paymentMethod = paymentMethod;
        }

        // due to an issue with the way the segment library works, we must send at least one of the two
        // options--otherwise it rejects the track call with no diagnostic messages. however, if we blindly
        // include both options, it sends a single comma for the value, which is undesireable. by only adding
        // one of the two (shippingMethod here being arbitrarily chosen), we always have at least one value, but
        // never send two empty values.
        if (!payload.shippingMethod && !payload.paymentMethod) {
            payload.shippingMethod = ' ';
        }

        this.analytics.track('Checkout Step Completed', payload);

        const shippingMethodId = shippingMethod ? shippingMethod.id : '';
        const completedStepId = stepId === ANALYTIC_STEP_TYPE.SHIPPING ?
            `${stepId}-${shippingMethodId}` :
            stepId;

        this.completedSteps[completedStepId] = true;
    }

    private getTrackingPayload({
        orderId,
        revenue,
        shipping,
        tax,
        discount,
        coupons,
        extraItemsData,
        lineItems,
    }: {
        orderId?: number;
        revenue: number;
        shipping: number;
        tax: number;
        discount: number;
        coupons: Coupon[];
        extraItemsData: ExtraItemsData;
        lineItems: LineItemMap;
    }) {
        const { code = '' } = this.getShopperCurrency() || {};
        const { storeName = '' } = this.getStoreProfile() || {};

        return {
            orderId,
            affiliation: storeName,
            revenue: this.toShopperCurrency(revenue),
            shipping: this.toShopperCurrency(shipping),
            tax: this.toShopperCurrency(tax),
            discount: this.toShopperCurrency(discount),
            coupon: (coupons || []).map(coupon => coupon.code).join(','),
            currency: code,
            products: this.getProducts(extraItemsData, lineItems),
        };
    }

    private hasStepCompleted(stepId: ANALYTIC_STEP_TYPE): boolean {
        const shippingOption = this.getSelectedShippingOption();
        const shippingMethodId = shippingOption ? shippingOption.id : '';

        return this.completedSteps.hasOwnProperty(stepId) ||
            (
                stepId === ANALYTIC_STEP_TYPE.SHIPPING &&
                this.completedSteps.hasOwnProperty(`${stepId}-${shippingMethodId}`)
            );
    }

    private hasStepViewed(stepId: ANALYTIC_STEP_TYPE): boolean {
        return !!this.viewedSteps[stepId];
    }

    private getIdFromStep(step: string): ANALYTIC_STEP_TYPE | null {
        const name = step.split('.');

        return ANALYTIC_STEPS[name[0]] || null;
    }

    private backfill(stepId: ANALYTIC_STEP_TYPE): void {
        for (const i of ANALYTIC_STEP_ORDER) {
            if (!this.hasStepViewed(i)) {
                this.trackViewed(i);
            }
            if (i === stepId) {
                break;
            }
            if (!this.hasStepCompleted(i)) {
                this.trackCompleted(i);
            }
        }
    }

    private trackViewed(stepId: ANALYTIC_STEP_TYPE): void {
        const currency = this.getShopperCurrency();

        this.analytics.track('Checkout Step Viewed', {
            step: stepId,
            currency: currency ? currency.code : '',
        });

        this.viewedSteps[stepId] = true;
    }

    private getOrder(): Order | undefined {
        const { data: { getOrder } } = this.checkoutService.getState();

        return getOrder();
    }

    private getCheckout(): Checkout | undefined {
        const { data: { getCheckout } } = this.checkoutService.getState();

        return getCheckout();
    }

    private getShopperCurrency(): ShopperCurrency | undefined {
        const { data: { getConfig } } = this.checkoutService.getState();
        const config = getConfig();

        return config && config.shopperCurrency;
    }

    private getStoreProfile(): StoreProfile | undefined {
        const { data: { getConfig } } = this.checkoutService.getState();
        const config = getConfig();

        return config && config.storeProfile;
    }

    private toShopperCurrency(amount: number): number {
        const { exchangeRate = 1 } = this.getShopperCurrency() || {};

        return Math.round(amount * exchangeRate * 100) / 100;
    }

    private saveExtraItemsData(id: string, lineItems: LineItemMap): ExtraItemsData {
        const data = [
            ...lineItems.physicalItems,
            ...lineItems.digitalItems,
        ].reduce((result, item) => {
            result[item.productId] = {
                brand: item.brand ? item.brand : '',
                category: item.categoryNames ? item.categoryNames.join(', ') : '',
            };

            return result;
        }, {} as ExtraItemsData);

        try {
            this.storage.setItem(this.getStorageKey(id), JSON.stringify(data));

            return data;
        } catch (err) {
            return {};
        }
    }

    private getStorageKey(id: string): string {
        return id ? `${ORDER_ITEMS_STORAGE_KEY}_${id}` : '';
    }

    private readExtraItemsData(id: string): ExtraItemsData | null {
        try {
            let item = this.storage.getItem(this.getStorageKey(id));

            // @todo: this is a fall back while we transition to the new storage key. If we cant find anything
            // with the new key, just try with the previous key to see if there's anything there.
            // remove this fallback once it's safe to assume there are no sessions left with the old key
            if (!item) {
                item = this.legacyStorage.getItem(ORDER_ITEMS_STORAGE_KEY);
            }

            return item ? JSON.parse(item) : null;
        } catch (err) {
            return null;
        }
    }

    private clearExtraItemData(id: string): void {
        try {
            this.storage.removeItem(this.getStorageKey(id));

            // @todo: remove this once it's safe to assume there are no sessions left with the old key
            this.legacyStorage.removeItem(ORDER_ITEMS_STORAGE_KEY);
        } catch (err) {
            // silently ignore the failure
        }
    }

    private getSelectedShippingOption(): ShippingOption | null {
        const { data } = this.checkoutService.getState();
        const shippingOption = data.getSelectedShippingOption();

        return (shippingOption && shippingOption.id && shippingOption.description) ?
            shippingOption :
            null;
    }

    private getPaymentMethodName(): string {
        const { data } = this.checkoutService.getState();
        const paymentMethod = data.getSelectedPaymentMethod();

        return (paymentMethod && paymentMethod.config) ?
            paymentMethod.config.displayName || '' :
            '';
    }

    private getProducts(itemsData: ExtraItemsData, lineItems: LineItemMap): AnalyticsProduct[] {
        const customItems: AnalyticsProduct[] = (lineItems.customItems || []).map(item => ({
            product_id: item.id,
            sku: item.sku,
            price: item.listPrice,
            quantity: item.quantity,
            name: item.name,
        }));

        const giftCertificateItems: AnalyticsProduct[] = lineItems.giftCertificates.map(item => {
            return {
                product_id: item.id,
                price: this.toShopperCurrency(item.amount),
                name: item.name,
                quantity: 1,
            };
        });

        const physicalAndDigitalItems: AnalyticsProduct[] = [
            ...lineItems.physicalItems,
            ...lineItems.digitalItems,
        ].map(item => {
            let itemAttributes;

            if (item.options && item.options.length) {
                itemAttributes = item.options.map(option => `${option.name}:${option.value}`);
                itemAttributes.sort();
            }

            return {
                product_id: item.productId,
                sku: item.sku,
                price: item.listPrice,
                image_url: item.imageUrl,
                name: item.name,
                quantity: item.quantity,
                brand: itemsData[item.productId] ? itemsData[item.productId].brand : '',
                category: itemsData[item.productId] ? itemsData[item.productId].category : '',
                variant: (itemAttributes || []).join(', '),
            };
        });

        return [
            ...customItems,
            ...physicalAndDigitalItems,
            ...giftCertificateItems,
        ];
    }
}

export interface AnalyticsProduct {
    product_id: string | number;
    price: number;
    quantity: number;
    name: string;
    sku?: string;
    image_url?: string;
    category?: string;
    variant?: string;
    brand?: string;
}

export interface ExtraItemsData {
    [productId: string]: {
        brand: string;
        category: string;
    };
}

export interface AnalyticsTracker {
    track(step: string, data: any): void;
}

export interface AnalyticsTrackerWindow extends Window {
    analytics: AnalyticsTracker;
}

export function isAnalyticsTrackerWindow(window: Window): window is AnalyticsTrackerWindow {
    return Boolean((window as AnalyticsTrackerWindow).analytics);
}
