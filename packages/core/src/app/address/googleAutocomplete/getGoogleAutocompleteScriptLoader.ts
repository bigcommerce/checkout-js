import GoogleAutocompleteScriptLoader from './GoogleAutocompleteScriptLoader';

let instance: GoogleAutocompleteScriptLoader;

export default function getGoogleAutocompleteScriptLoader(): GoogleAutocompleteScriptLoader {
    if (!instance) {
        instance = new GoogleAutocompleteScriptLoader();
    }

    return instance;
}
