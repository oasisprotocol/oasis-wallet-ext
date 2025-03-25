import extension from 'src/mockWebextension';
import { QUERY_TAB_TYPE } from '../constant/specifyType';
/**
 * Encapsulation class for sending messages
 * @param {*} message
 * @param {*} sendResponse
 */
export function sendMsg(message, sendResponse) {
  const { action, payload } = message
  extension.runtime.sendMessage({ action, payload }, async (params) => {
    sendResponse && sendResponse(params)
  });
}


/**
 * open the Web page
 * @param {*} url
 */
export function openTab(url) {
  open(url, '_blank')
}


/**
 * get current active tab
 *
 */


export function getActiveTab(type, params) {
  return new Promise((resolve, reject) => {
    resolve([])
  })
}
