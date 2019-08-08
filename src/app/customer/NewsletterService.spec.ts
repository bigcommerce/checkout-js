import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getResponse } from '../common/request/responses.mock';

import NewsletterService from './NewsletterService';

describe('NewsletterService', () => {
    let requestSender: RequestSender;
    let newsletterService: NewsletterService;

    beforeEach(() => {
        requestSender = createRequestSender();
        newsletterService = new NewsletterService(requestSender);
    });

    it('returns resolved promise if request is successful', async () => {
        const email = 'foo';
        const firstName = 'bar';
        const response = getResponse({});

        jest.spyOn(requestSender, 'post')
            .mockResolvedValue(response);

        expect(await newsletterService.subscribe({ email, firstName }))
            .toEqual(response);

        expect(requestSender.post)
            .toHaveBeenCalledWith('/subscribe.php', {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: {
                    action: 'subscribe',
                    nl_email: email,
                    nl_first_name: firstName,
                    check: '1',
                },
            });
    });

    it('returns rejected promise if request is unsuccessful', async () => {
        const email = 'foo';
        const firstName = 'bar';
        const response = { status: 500 };

        jest.spyOn(requestSender, 'post')
            .mockRejectedValue(response);

        try {
            await newsletterService.subscribe({ email, firstName });
        } catch (error) {
            expect(error)
                .toEqual(response);
        }
    });
});
