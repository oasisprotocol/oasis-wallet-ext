import { bech32 } from 'bech32'

export const matchList = [
  {
    text: ('atLeastOneNumber'),
    expression: /[0-9]+/,
    bool: false
  },
  {
    text: ('atLeastOneLowercaseLetter'),
    expression: /[a-z]+/,
    bool: false
  },
  {
    text: ('atLeastOneUppercaseLetter'),
    expression: /[A-Z]+/,
    bool: false
  },
  {
    text: ('passwordRequires'),
    expression: /.{8,32}/,
    bool: false
  },
]

/**
 * pwd validate  must gt 8
 */
export function pwdValidate(pwd) {
  let list = matchList.map(v => {
    if (v.expression.test(pwd)) {
      v.bool = true;
    } else {
      v.bool = false;
    }
    return v;
  })
  return list
}
/**
 * pwd confirm input
 */
export function pwdConfirmValidate(pwd, confirmPwd) {
  let realPwd = pwd.replace(/(^\s*)|(\s*$)/g, "");
  let realConfirmPwd = confirmPwd.replace(/(^\s*)|(\s*$)/g, "");
  return realPwd === realConfirmPwd
}

/**
 * Verify that the address is valid
 * @param {*} address
 */
export function addressValid(address) {
  let valid = false
  try {
    if (!address.match(/^oasis1/)) {
      throw new Error('Invalid')
    }

    bech32.decode(address)
    valid = true
  } catch (e) {}

  return valid
}