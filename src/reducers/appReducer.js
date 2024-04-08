import differenceInDays from 'date-fns/differenceInDays'
import { DEFAULT_LANGUAGE, NEW_EXTENSION_RELEASE_DATE } from "../../config";
import { DISMISSED_NEW_EXTENSION_WARNING } from "../constant/storageKey";
import { getLocal, removeLocal } from "../background/storage/localStorage";

const SET_LANGUAGE = "SET_LANGUAGE"
const HIDE_NEW_EXTENSION_WARNING = "HIDE_NEW_EXTENSION_WARNING"


export function setLanguage(language) {
    return {
        type: SET_LANGUAGE,
        language
    };
}

export function hideNewExtensionWarning() {
    return {
        type: HIDE_NEW_EXTENSION_WARNING
    };
}

function shouldShowNewExtensionWarning() {
    const dismissed = true;
    if (!dismissed || !NEW_EXTENSION_RELEASE_DATE) {
        return !dismissed;
    }

    const dismissedDate = new Date(dismissed);
    const releaseDate = new Date(NEW_EXTENSION_RELEASE_DATE);
    // Always show the warning if the release date is less than or equal to 3 days away
    if (differenceInDays(releaseDate, new Date()) <= 3) {
        return true;
    }
    // Show the warning and reset the dismissed date
    // if it was set more than two weeks before the release date
    if (differenceInDays(releaseDate, dismissedDate) > 14) {
        removeLocal(DISMISSED_NEW_EXTENSION_WARNING);
        return true;
    }

    return false;
}


const initState = {
    language: DEFAULT_LANGUAGE,
    showNewExtensionWarning: shouldShowNewExtensionWarning()
};

const appReducer = (state = initState, action) => {
    switch (action.type) {
        case SET_LANGUAGE:
            let language = action.language
            return {
                ...state,
                language,
            };
        case HIDE_NEW_EXTENSION_WARNING:
            return {
                ...state,
                showNewExtensionWarning: false,
            };
        default:
            return state;
    }
};

export default appReducer;
