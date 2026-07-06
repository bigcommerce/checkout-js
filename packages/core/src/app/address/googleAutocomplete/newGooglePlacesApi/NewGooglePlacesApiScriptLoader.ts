interface MapsBootstrapConfig {
    key: string;
    v: string;
    language?: string;
}

import { type GoogleMapsSdk } from '../googleAutocompleteTypes';

interface BootstrapGlobalScope {
    google?: {
        maps?: {
            importLibrary?: (library: string, ...rest: unknown[]) => Promise<unknown>;
            [key: string]: unknown;
        };
    };
}

/**
 * This is based on the official Google Maps JavaScript API loader example:
 * https://developers.google.com/maps/documentation/javascript/load-maps-js-api
 *
 * This loader is only ever reached when the CHECKOUT-10026.new_google_places_api flag is on for a
 * store. Stores with the flag off never construct or call this class, so they keep loading
 * the Maps JS API exactly as they do today, via GoogleAutocompleteScriptLoader.
 *
 * When the flag IS on, both the new Places API classes and the legacy
 * AutocompleteService/PlacesService classes must share this same loader instance/promise.
 * This is because both old and new API share the same Google's Maps JS API
 * and it breaks if loaded twice on the same page.
 */
function bootstrapGoogleMapsImportLibrary({ key, v, language }: MapsBootstrapConfig): void {
    const CALLBACK_KEY = '__ib__';
    const globalScope: BootstrapGlobalScope = window;
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

            const script = document.createElement('script');

            script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
            script.nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce ?? '';

            script.onerror = () => {
                // Clear the cached promise so a later retry appends a fresh <script> tag
                loadPromise = undefined;
                reject(new Error('The Google Maps JavaScript API could not load.'));
            };

            mapsNs[CALLBACK_KEY] = resolve;
            document.head.append(script);
        });

        return loadPromise;
    };

    mapsNs.importLibrary = (library: string, ...rest: unknown[]): Promise<unknown> => {
        requestedLibraries.add(library);

        return loadScript().then(() => mapsNs.importLibrary?.(library, ...rest));
    };
}

export class NewGooglePlacesApiScriptLoader {
    private _placesPromise?: Promise<google.maps.PlacesLibrary>;

    loadPlacesLibrary(apiKey: string): Promise<google.maps.PlacesLibrary> {
        if (this._placesPromise) {
            return this._placesPromise;
        }

        // `importLibrary` is the single entry point for the new Places classes.
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

    // Adapter so GoogleAutocompleteService (legacy AutocompleteService/PlacesService) can be
    // handed this loader and reuse the already-loaded script instead of loading its own.
    loadMapsSdk(apiKey: string): Promise<GoogleMapsSdk> {
        return this.loadPlacesLibrary(apiKey).then(({ AutocompleteService, PlacesService }) => ({
            places: { AutocompleteService, PlacesService },
        }));
    }
}
