// eslint-disable-next-line import/no-extraneous-dependencies
import { Har } from '@pollyjs/persister';
import FSPersister from '@pollyjs/persister-fs';
import { includes } from 'lodash';

import { sensitiveHeaders } from './senstiveDataConfig';

/**
 * @internal
 * PollyJS (PollyObject) utilises this to process HAR data before writing it to a file.
 */
export class CustomFSPersister extends FSPersister {
    static get id(): string {
        return 'CustomFSPersister';
    }

    async onSaveRecording(recordingId: string, data: Har): Promise<void> {
        const dummyData = '*';

        data.log.entries.forEach((entry) => {
            if (includes(entry.request.url, 'api/storefront/checkout-settings')) {
                if (entry.response.content.text) {
                    const response = JSON.parse(entry.response.content.text);

                    response.storeConfig.paymentSettings.bigpayBaseUrl = '*';
                    entry.response.content.text = JSON.stringify(response);
                }
            }

            entry.response.headers = entry.response.headers.map(
                (header: { name: string; value: string }) => {
                    if (includes(sensitiveHeaders, header.name)) {
                        return { ...header, value: dummyData };
                    }

                    return header;
                },
            );
            entry.response.cookies = [];
        });

        return super.onSaveRecording(recordingId, data);
    }
}
