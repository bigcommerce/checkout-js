import { readFileSync } from 'fs';
import { resolve } from 'path';

let appVersion = '';

export function getAppVersion(): string {
    if (appVersion) {
        return appVersion;
    }

    const manifestPath = resolve(__dirname, '../../../../../../dist/manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest: unknown = JSON.parse(manifestContent);

    if (hasAppVersion(manifest)) {
        appVersion = String(manifest.appVersion);

        return appVersion;
    }

    return '';
}

function hasAppVersion(manifest: unknown): manifest is { appVersion: string } {
    return (
        typeof manifest === 'object' &&
        manifest !== null &&
        'appVersion' in manifest &&
        typeof manifest.appVersion === 'string'
    );
}
