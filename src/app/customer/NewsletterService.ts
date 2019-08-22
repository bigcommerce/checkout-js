import { RequestSender, Response } from '@bigcommerce/request-sender';

export interface NewsletterSubscribeData {
    email: string;
    firstName?: string;
}

export default class NewsletterService {
    constructor(
        private requestSender: RequestSender
    ) {}

    subscribe(data: NewsletterSubscribeData): Promise<Response> {
        return this.requestSender.post('/subscribe.php', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                action: 'subscribe',
                nl_email: data.email || '',
                nl_first_name: data.firstName || '',
                check: '1',
            },
        });
    }
}
