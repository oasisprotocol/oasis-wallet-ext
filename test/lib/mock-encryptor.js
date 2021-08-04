const sinon = require('sinon');

const mockHex = '0xabcdef0123456789';
const mockKey = Buffer.alloc(32);
let cacheVal;

module.exports = {
  encrypt: sinon.stub().callsFake(function (_password, dataObj) {
    cacheVal = dataObj;
    return Promise.resolve(_password+"-"+dataObj);
  }),

  decrypt(_password, _text) {
    let txt = _text.split("-")
    let pwd = txt[0]
    let data = txt[1]
    if(pwd === _password){
      return Promise.resolve(data);
    }else{
      return Promise.reject("pwd error");
    }
  },

  encryptWithKey(key, dataObj) {
    return this.encrypt(key, dataObj);
  },

  decryptWithKey(key, text) {
    return this.decrypt(key, text);
  },

  keyFromPassword(_password) {
    return Promise.resolve(mockKey);
  },

  generateSalt() {
    return 'WHADDASALT!';
  },
};
