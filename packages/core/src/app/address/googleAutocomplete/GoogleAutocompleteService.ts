import getGoogleAutocompleteScriptLoader from './getGoogleAutocompleteScriptLoader';
import { type GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';

export default class GoogleAutocompleteService {
    constructor(
        private _apiKey: string,
        private _scriptLoader: GoogleAutocompleteScriptLoader = getGoogleAutocompleteScriptLoader(),
    ) {}

    private convertToRegionCodes(
        country: string | string[] | null | undefined,
    ): string[] | undefined {
        if (!country) return undefined;

        return Array.isArray(country) ? country : [country];
    }

    async getSuggestions(
        input: string,
        types: string[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<google.maps.places.AutocompleteSuggestion[]> {
        const { AutocompleteSuggestion } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);
        const includedRegionCodes = this.convertToRegionCodes(componentRestrictions?.country);

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes: types,
            includedRegionCodes,
        });

        return suggestions;
    }

    async getPlaceDetails(placeId: string, fields: string[]): Promise<google.maps.places.Place> {
        const { Place } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);
        const place = new Place({ id: placeId });

        await place.fetchFields({ fields });

        return place;
    }
}
