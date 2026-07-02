import { NewGooglePlacesApiScriptLoader } from './NewGooglePlacesApiScriptLoader';

let instance: NewGooglePlacesApiScriptLoader;

export default function getNewGooglePlacesApiScriptLoader(): NewGooglePlacesApiScriptLoader {
    if (!instance) {
        instance = new NewGooglePlacesApiScriptLoader();
    }

    return instance;
}
