import { getScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { GoogleAutocompleteWindow, GoogleMapsSdk } from './googleAutocompleteTypes';

export default class GoogleAutocompleteScriptLoader {
    private _scriptLoader: ScriptLoader;
    private _googleAutoComplete?: Promise<GoogleMapsSdk>;

    constructor() {
        this._scriptLoader = getScriptLoader();
    }

    loadMapsSdk(apiKey: string): Promise<GoogleMapsSdk> {
        if (this._googleAutoComplete) {
            return this._googleAutoComplete;
        }

        this._googleAutoComplete = new Promise((resolve, reject) => {
            const callbackName = 'initAutoComplete';
            const params = [
                'language=en',
                `key=${apiKey}`,
                'libraries=places',
                `callback=${callbackName}`,
            ].join('&');

            (window as GoogleCallbackWindow)[callbackName] = () => {
                if (isAutocompleteWindow(window)) {
                    resolve(window.google.maps);
                }

                reject();
            };

            this._scriptLoader
                .loadScript(`//maps.googleapis.com/maps/api/js?${params}`)
                .catch((e) => {
                    this._googleAutoComplete = undefined;
                    throw e;
                });
        });

        return this._googleAutoComplete;
    }
}

function isAutocompleteWindow(window: Window): window is GoogleAutocompleteWindow {
    const autocompleteWindow = window as GoogleAutocompleteWindow;

    return Boolean(
        autocompleteWindow.google &&
            autocompleteWindow.google.maps &&
            autocompleteWindow.google.maps.places,
    );
}

export interface GoogleCallbackWindow extends Window {
    initAutoComplete?(): void;
}
