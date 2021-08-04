global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key];
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    }
};


global.navigator={

}
require('jsdom-global')()
window.localStorage = {}

if (!('crypto' in window)) { window.crypto = {} }
window.crypto.getRandomValues = require('polyfill-crypto.getrandomvalues')

