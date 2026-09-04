import { NewGooglePlacesApiScriptLoader } from './NewGooglePlacesApiScriptLoader';

let instance: NewGooglePlacesApiScriptLoader;

export function getNewGooglePlacesApiScriptLoader(): NewGooglePlacesApiScriptLoader {
    if (!instance) {
        instance = new NewGooglePlacesApiScriptLoader();
    }

    return instance;
}
