import { chromium, FullConfig } from '@playwright/test';
import { checkout, checkoutConfig, formFields, order } from './paymentIntegrations/api.mock';

async function globalSetup(config: FullConfig) {
    // const browser = await chromium.launch();
    // const page = await browser.newPage();
}

export default globalSetup;
