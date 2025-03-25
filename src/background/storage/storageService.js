import extension from '../../mockWebextension';

/**
 * Stored in local storage
 * @param {{keyringData: EncryptedData}} value
 */
export function save(value) {
    Object.entries(value).forEach(([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v))
    })
}


/**
 * Get the local stored value
 * @param {'keyringData'} key
 * @returns {Promise<{keyringData: EncryptedData}>}
 */
export function get(key) {
    return new Promise((resolve, reject) => {
        resolve({
            // @ts-expect-error Forcefully extending encrypted string type
            [key]: JSON.parse(localStorage.getItem(key))
        })
    });
}

/**
 * Remove local stored value
 * @param {'keyringData'} key
 */
export function removeValue(key) {
    return window.localStorage.removeItem(key);
}
