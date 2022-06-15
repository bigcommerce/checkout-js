import { Page } from '@playwright/test';

export interface CheckoutPagePreset {
    apply(page: Page): Promise<void>;
}
