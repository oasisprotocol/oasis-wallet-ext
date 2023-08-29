import { DEFAULT_LANGUAGE } from "../../config";
import { NEW_EXTENSION_WARNING_DISMISSED } from "../constant/storageKey";
import { getLocal } from "../background/storage/localStorage";

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

const initState = {
    language: DEFAULT_LANGUAGE,
    showNewExtensionWarning: !getLocal(NEW_EXTENSION_WARNING_DISMISSED)
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
