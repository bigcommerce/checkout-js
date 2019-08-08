export interface RavenClient {
    captureException(error: any, extra: RavenOptions): void;
    setShouldSendCallback(callback: RavenShouldSendCallback): void;
    setTagsContext(tags: any): void;
}

export interface RavenOptions {
    fingerprint: string[];
    tags?: { [key: string]: string };
    extra?: { [key: string]: string };
    level: 'info' | 'warning' | 'error';
}

export interface RavenException {
    stacktrace: string;
    type: string;
    value: string;
}

export type RavenShouldSendCallback = (data: { exception?: { values: RavenException[] } }) => void;

export interface RavenWindow extends Window {
    Raven: RavenClient;
}
