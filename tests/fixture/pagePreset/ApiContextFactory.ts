import { request, APIRequestContext, Page } from '@playwright/test';

export class ApiContextFactory {
    private apiContext: APIRequestContext | undefined;

    async create(page: Page, storeURL: string): Promise<APIRequestContext> {
        if (!this.apiContext) {
            await this.setup(page, storeURL);
        }
        if (this.apiContext) {
            return this.apiContext;
        } else {
            throw new Error(`Api context setup failed. Is ${storeURL} accessible now?`);
        }
    }

    private async setup(page: Page, storeURL: string): Promise<void> {
        await page.goto(storeURL);

        let cookieStr: string = '';
        let xsrfTokenStr: string = '';
        const cookies = await page.context().cookies();
        for (const cookie of cookies) {
            if (cookie.name === 'XSRF-TOKEN') {
                xsrfTokenStr = cookie.value;
            }
            cookieStr += `${cookie.name}=${cookie.value};`;
        }

        this.apiContext = await request.newContext({
            baseURL: storeURL + '/api/storefront/',
            extraHTTPHeaders: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-xsrf-token': xsrfTokenStr,
                cookie: cookieStr,
            },
        });
    }
}
