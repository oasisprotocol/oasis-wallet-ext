import extension from 'extensionizer'
import { QUERY_TAB_TYPE } from '../constant/specifyType';
/**
 * Encapsulation class for sending messages
 * @param {*} message
 * @param {*} sendResponse
 */
export function sendMsg(message, sendResponse) {
  const { messageSource, action, payload } = message
  extension.runtime.sendMessage(
    {
      messageSource, action, payload
    },
    async (params) => {
      sendResponse && sendResponse(params)
    }
  );
}


/**
 * open the Web page
 * @param {*} url
 */
export function openTab(url) {
  extension.tabs.create({
    url: url,
  });
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
