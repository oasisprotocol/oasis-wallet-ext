import extension from '../../mockWebextension';
const extensionStorage = extension.storage && extension.storage.local

/**
 * Stored in local storage
 * @param {{keyringData: EncryptedData}} value
 */
export function save(value) {
    return extensionStorage.set(value, () => {
        let error = extension.runtime.lastError
        if (error) {
            throw error;
        }
    });
}


/**
 * Get the local stored value
 * @param {'keyringData'} key
 * @returns {Promise<{keyringData: EncryptedData}>}
 */
export function get(key) {
    return new Promise((resolve, reject) => {
        extensionStorage.get(key, items => {
            let error = extension.runtime.lastError
            if (error) {
                reject(error);
            }
            // @ts-expect-error Forcefully extending encrypted string type
            resolve(items);
        });
    });
}

/**
 * Remove local stored value
 * @param {'keyringData'} key
 */
export function removeValue(key) {
    return extensionStorage.remove(key, () => {
        let error = extension.runtime.lastError
        if (error) {
            throw error;
        }
    });
}

/**
 * Remove all storage
 */
export function clearStorage() {
    extensionStorage.clear();
}
