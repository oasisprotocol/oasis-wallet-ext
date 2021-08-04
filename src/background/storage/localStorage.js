
/**
 * Stored in local storage
 */
export function saveLocal(key, value) {
    return localStorage.setItem(key, value);
}


/**
 * Get the local stored value
 * @param {*} value
 */
export function getLocal(key) {
    return localStorage.getItem(key);
}

/**
 * Remove local stored value
 * @param {*} value
 */
export function removeLocal(key) {
    localStorage.removeItem(key);
}

/**
 * Remove all storage
 */
export function clearLocal() {
    localStorage.clear();
}
