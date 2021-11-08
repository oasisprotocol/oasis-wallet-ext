
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

/**
 * get all local storage
 */
 export function getAllLocal() {
    return localStorage.valueOf();
}


/**
 * delete all local storage except 
 */
 export function clearLocalExcept(targetKey) {
     if(targetKey){
        let data = getAllLocal()
        let keys = Object.keys(data)
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if(key!== targetKey ){
                removeLocal(key)
            }
        }
     }else{
        clearLocal()
     }
}

