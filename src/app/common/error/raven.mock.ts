import { RavenClient } from './raven';

export function getRavenClient(): RavenClient {
    return {
        captureException: jest.fn(),
        setShouldSendCallback: jest.fn(),
        setTagsContext: jest.fn(),
    };
}
