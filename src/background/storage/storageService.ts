import extension from 'extensionizer';
const extensionStorage = extension.storage && extension.storage.local

/**
 * Stored in local storage
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
 * @param {*} value
 */
export function get(value) {
    return new Promise((resolve, reject) => {
        extensionStorage.get(value, items => {
            let error = extension.runtime.lastError
            if (error) {
                reject(error);
            }
            resolve(items);
        });
    });
}

/**
 * Remove local stored value
 * @param {*} value
 */
export function removeValue(value) {
    return extensionStorage.remove(value, () => {
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
