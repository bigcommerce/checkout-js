interface MapsBootstrapConfig {
    key: string;
    v: string;
    language?: string;
}

/**
 * Google's official inline Maps JavaScript API bootstrap loader based on:
 * https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 */
function bootstrapGoogleMapsImportLibrary({ key, v, language }: MapsBootstrapConfig): void {
    const CALLBACK_KEY = '__ib__';
    const doc = document;
    const globalScope = window as Record<string, any>;
    const googleNs = (globalScope.google = globalScope.google || {});
    const mapsNs = (googleNs.maps = googleNs.maps || {});

    if (typeof mapsNs.importLibrary === 'function') {
        return;
    }

    const requestedLibraries = new Set<string>();
    let loadPromise: Promise<void> | undefined;

    const loadScript = (): Promise<void> => {
        if (loadPromise) {
            return loadPromise;
        }

        loadPromise = new Promise<void>((resolve, reject) => {
            const params = new URLSearchParams({
                key,
                v,
                callback: `google.maps.${CALLBACK_KEY}`,
                libraries: [...requestedLibraries].join(','),
            });

            if (language) {
                params.set('language', language);
            }

            const script = doc.createElement('script');

            script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
            script.nonce = doc.querySelector<HTMLScriptElement>('script[nonce]')?.nonce ?? '';
            script.onerror = () =>
                reject(new Error('The Google Maps JavaScript API could not load.'));
            mapsNs[CALLBACK_KEY] = resolve;
            doc.head.append(script);
        });

        return loadPromise;
    };

    mapsNs.importLibrary = (library: string, ...rest: unknown[]): Promise<unknown> => {
        requestedLibraries.add(library);

        return loadScript().then(() => mapsNs.importLibrary(library, ...rest));
    };
}

export class NewGooglePlacesApiScriptLoader {
    private _placesPromise?: Promise<google.maps.PlacesLibrary>;

    loadPlacesLibrary(apiKey: string): Promise<google.maps.PlacesLibrary> {
        if (this._placesPromise) {
            return this._placesPromise;
        }

        // `importLibrary` is the single entry point both the new and legacy classes
        if (typeof google === 'undefined' || typeof google.maps?.importLibrary !== 'function') {
            bootstrapGoogleMapsImportLibrary({ key: apiKey, v: 'weekly', language: 'en' });
        }

        this._placesPromise = (
            google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>
        ).catch((e) => {
            this._placesPromise = undefined;
            throw e;
        });

        return this._placesPromise;
    }
}
