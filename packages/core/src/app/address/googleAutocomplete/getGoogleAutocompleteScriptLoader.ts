import { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';

let instance: GoogleAutocompleteScriptLoader;

export function getGoogleAutocompleteScriptLoader(): GoogleAutocompleteScriptLoader {
    if (!instance) {
        instance = new GoogleAutocompleteScriptLoader();
    }

    return instance;
}
