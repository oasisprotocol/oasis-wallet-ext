import extension from 'extensionizer'
import { getLanguage } from "../i18n"
import { QUERY_TAB_TYPE } from '../constant/specifyType';
import { getSendTxError } from './utils';
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
    // 1. 获取当前活跃tab URL 直接调用
    // 2. 获取所以tab
    // 3，根据windowId 查询tab
    let queryParams = {}
    switch (type) {
      case QUERY_TAB_TYPE.GET_CURRENT_ACTIVE_TAB:
        queryParams = {
          active: true,
          currentWindow: true
        }
        break;
      case QUERY_TAB_TYPE.GET_ACTIVE_TAB_BY_URL:
        queryParams = {
          active: true,
        }
        if (params && params.origin) {
          queryParams.url = params.origin + "/*"
        }
        break
      case QUERY_TAB_TYPE.GET_TAB_BY_WINDOW_ID:
        queryParams.windowId = params.windowId
        break
      default:
        break;
    }
    extension.tabs.query({
      ...queryParams
    }, function (tabs) {
      resolve(tabs)
    })
  })
}


export function showErrorNotification(address, err) {
  let errMessage = getSendTxError(err)
  let title = getLanguage('notificationTitle')
    let message = address+" :"+errMessage
    let notifyId =address +  Date.now()
    extension.notifications.create(notifyId, {
        title: title,
        message: message,
        iconUrl: '/img/oasis.png',
        type: 'basic'
    });
}