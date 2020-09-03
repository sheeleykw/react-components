import React from 'react';
import { c } from 'ttag';

const useAutocompleteAriaProps = ({ baseId, selectedSuggest }: { baseId: string; selectedSuggest?: number }) => {
    const helpTextId = `${baseId}-help-text`;
    const helpText = (
        <span id={helpTextId} className="sr-only">
            {c('Help')
                .t`Use Up and Down keys to access and browse suggestions after input. Press Enter to confirm your choice, or Escape to close suggestions box.`}
        </span>
    );
    const getNumberHelpText = (numberOfSuggests: number) =>
        numberOfSuggests > 0 && (
            <div className="sr-only" aria-live="assertive">{c('Help')
                .t`Found ${numberOfSuggests} suggestions, use keyboard to navigate.`}</div>
        );
    const inputId = `${baseId}-input`;
    const suggestionsId = `${baseId}-suggestions`;
    const getOptionId = (idx: number) => `${baseId}-option-${idx}`;
    return {
        labelAriaProps: {
            for: inputId,
        },
        inputAriaProps: {
            id: inputId,
            role: 'combobox',
            'aria-autocomplete': 'both' as const,
            'aria-owns': suggestionsId,
            'aria-activedescendant': selectedSuggest !== undefined ? getOptionId(selectedSuggest) : undefined,
            'aria-described-by': helpTextId,
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: false,
            autoComplete: 'off',
        },
        suggestionsAriaProps: {
            role: 'listbox',
            id: suggestionsId,
        },
        getAriaPropsForOption: (idx: number) => ({
            id: getOptionId(idx),
            role: 'option',
        }),
        helpText,
        getNumberHelpText,
    };
};

export default useAutocompleteAriaProps;
