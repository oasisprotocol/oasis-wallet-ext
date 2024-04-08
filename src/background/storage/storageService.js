import extension from '../../mockWebextension';

/**
 * Stored in local storage
 */
export function save(value) {
    Object.entries(value).forEach(([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v))
    })
}


/**
 * Get the local stored value
 * @param {*} value
 */
export function get(value) {
    return new Promise((resolve, reject) => {
        resolve({
            [value]: JSON.parse(localStorage.getItem(value))
        })
    });
}

/**
 * Remove local stored value
 * @param {*} value
 */
export function removeValue(value) {
    return window.localStorage.removeItem(value);
}
