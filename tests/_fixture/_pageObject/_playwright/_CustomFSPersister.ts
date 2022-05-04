import { Har } from '@pollyjs/persister';
import FSPersister from '@pollyjs/persister-fs';

export default class CustomFSPersister extends FSPersister {
    static get id(): string {
        return 'CustomFSPersister';
    }

    async onSaveRecording(recordingId: string, data: Har): Promise<void> {
        const dummyData = '*';
        const sensitiveHeaderNames = [
            'authorization',
            'cookie',
            'set-cookie',
            'token',
            'x-session-hash',
            'x-xsrf-token',
        ];

        data.log.entries.forEach( entry => {
            entry.request.headers = entry.request.headers.map((header: { name: string; value: string }) => {
                if (sensitiveHeaderNames.includes(header.name)) {
                    return { ...header, value: dummyData };
                }

                return header;
            });
            entry.response.headers = entry.response.headers.map((header: { name: string; value: string }) => {
                if (sensitiveHeaderNames.includes(header.name)) {
                    return { ...header, value: dummyData };
                }

                return header;
            });
            entry.response.cookies = [];
        });

        return super.onSaveRecording(recordingId, data);
    }
}
