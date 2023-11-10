import PlacesAutocomplete from 'react-places-autocomplete'
import * as React from 'react'

type FitmentPlacesSearchProps = {
    searchValue: string
    handleSearchChange: (value: string) => void
    handleSelect: (address: string, placeId: string) => void
}

export const FitmentPlacesSearch = ({
    searchValue,
    handleSearchChange,
    handleSelect,
}: FitmentPlacesSearchProps) => {
    return (
        <PlacesAutocomplete
            value={searchValue}
            onChange={handleSearchChange}
            onSelect={handleSelect}
            searchOptions={{
                componentRestrictions: {
                    // @ts-ignore
                    country: ['au', 'nz'],
                },
            }}
        >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div className="fitment-places-wrapper">
                    <label className="places-label">
                        Enter your address to find your nearest fitment centre
                    </label>
                    <div className="places-input-wrapper">
                        <input
                            {...getInputProps({
                                placeholder: '',
                                id: 'location-search',
                            })}
                        />
                        {searchValue != '' && (
                            <button
                                onClick={() => handleSearchChange('')}
                                className="flex items-center border border-red text-red px-2 py-1 cursor:pointer text-xs"
                            >
                                CLEAR
                            </button>
                        )}
                    </div>
                    <div className="places-suggestions">
                        {loading && <div>Loading...</div>}
                        {suggestions.map((suggestion) => {
                            return (
                                // eslint-disable-next-line react/jsx-key
                                <div
                                    {...getSuggestionItemProps(suggestion, {})}
                                    key={suggestion.placeId}
                                >
                                    <span>{suggestion.description}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </PlacesAutocomplete>
    )
}

export const FitmentPlacesPlaceholder = () => (
    <div className="fitment-places-wrapper">
        <label className="places-label">Enter your address to find your nearest fitment centre</label>
        <div className="places-input-wrapper">
            <span className="placeholder">Loading...</span>
        </div>
    </div>
)
