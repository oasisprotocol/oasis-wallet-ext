import extension from 'extensionizer';
import ObservableStore from 'obs-store';
import { QUERY_TAB_TYPE } from '../../constant/specifyType';
import { BACKGROUND_KEYS_CHANGED, DAPP_ACTION_CLOSE_WINDOW, DAPP_ACTION_GET_ACCOUNT, DAPP_ACTION_SEND_TRANSACTION, DAPP_CLOSE_POPUP_WINDOW, FROM_BACK_TO_RECORD } from '../../constant/types';
import { getActiveTab, sendMsg } from '../../utils/commonMsg';
import { closePopupWindow, openPopupWindow } from '../../utils/popup';
import { connectAccountDataFilter, hex2uint, isNumber, uint2hex } from '../../utils/utils';
import { addressValid } from '../../utils/validator';
import apiService from './APIService';
let signRequests = [];

export const windowId = {
  approve_page: "approve_page",
  request_sign: "request_sign",
}
let badgeList = []

const BADGE_ADD = "BADGE_ADD"
const BADGE_MINUS = "BADGE_MINUS"
class ExtDappService {
  constructor() {
    this.dappStore = new ObservableStore({
      approveList: {},
      currentOpenWindow: {}
    })
  }
  checkWalletStatus() {
    return new Promise(async (resolve, reject) => {
      let currentAccount = await apiService.getCurrentAccount()
      if (currentAccount && currentAccount.localAccount && currentAccount.localAccount.keyringData) {
        resolve(true)
      } else {
        reject({ error: "Please create a wallet first" })
      }
    })
  }

  async getFormatPublickey(key) {
    return [key]
  }

  async requestAccounts(origin) {
    let that = this
    return new Promise(async (resolve, reject) => {
      try {
        let walletStatus = await this.checkWalletStatus().catch(error => error)
        if (walletStatus.error) {
          reject(walletStatus)
          return
        }
        let account = await this.getCurrentApproveAccount(origin)
        if (account) {
          resolve(account)
          return
        }
        async function onMessage(message, sender, sendResponse) {
          const { action, payload } = message;
          switch (action) {
            case DAPP_ACTION_GET_ACCOUNT:
              extension.runtime.onMessage.removeListener(onMessage)
              await closePopupWindow(windowId.approve_page)
              that.setBadgeContent("approve_page", BADGE_MINUS)
              if (payload.selectAccount && payload.selectAccount.length > 0) {
                let approveList = that.dappStore.getState().approveList
                approveList[origin] = []
                let currentAddress = payload.currentAddress
                let result = that.setTargetConnect(payload.selectAccount, currentAddress)
                if (result.connectStatus) {
                  approveList[origin] = result.newList
                } else {
                  let newList = result.newList
                  newList[0].isConnecting = true
                  approveList[origin] = newList
                }
                that.dappStore.updateState({
                  approveList
                })
                let siteApproveAccount = approveList[origin]
                siteApproveAccount = siteApproveAccount.filter((item, index) => {
                  return item.isConnecting
                })
                let resultAccount = siteApproveAccount[0]
                let res = await that.getFormatPublickey(resultAccount.publicKey)
                resolve(res)
              } else {
                reject({ error: "User Reject" })
              }
              sendResponse()
              break;
            case DAPP_ACTION_CLOSE_WINDOW:
              extension.runtime.onMessage.removeListener(onMessage)
              resolve(payload.account)
              await closePopupWindow(payload.page)
              that.setBadgeContent("approve_page", BADGE_MINUS)
              sendResponse()
              break
            default:
              break;
          }
        }
        extension.runtime.onMessage.addListener(onMessage)
        let isUnlocked = await this.getAppLockStatus()
        isUnlocked = isUnlocked ? 1 : 0
        let siteUrl = origin
        let icon = await this.getWebIcon(origin)
        this.popupId = await this.dappOpenPopWindow('./popup.html#/approve_page?isUnlocked=' + encodeURIComponent(isUnlocked)
          + "&siteUrl=" + encodeURIComponent(siteUrl)
          + "&siteIcon=" + encodeURIComponent(icon),
          windowId.approve_page, "dapp")
        this.setBadgeContent("approve_page", BADGE_ADD)
      } catch (error) {
        reject(error)
      }
    })

  }
  async getWebIcon(origin) {
    let tabs = await getActiveTab(QUERY_TAB_TYPE.GET_ACTIVE_TAB_BY_URL, { origin })
    if (tabs.length > 0) {
      let tab = tabs[0]
      let webIcon = tab?.favIconUrl || ""
      return webIcon
    }
    return ""

  }
  async getApproveAccountPublicKey(origin) {
    return new Promise(async (resolve, reject) => {

      let account = await this.getCurrentApprovePublicKey(origin)
      if (account.error) {
        reject(account)
      } else {
        if (account) {
          resolve(account)
          return
        } else {
          reject({ error: "Please connect the account first" })
        }
      }
    })
  }

  async signTransaction(params, site) {
    return new Promise(async (resolve, reject) => {

      let walletStatus = await this.checkWalletStatus().catch(error => error)
      if (walletStatus.error) {
        reject(walletStatus)
        return
      }

      let that = this
      try {
        if (!params.from || !addressValid(params.from)) {
          reject({ error: "must have from address" })
          return
        }
        let approveAccount = await this.getCurrentApproveAccount(site, params.from)
        if (!approveAccount) {
          reject({ error: "Please connect first" })
          return
        }
        if (params.to.length <= 0 || !addressValid(params.to)) {
          reject({ error: "Please enter a valid wallet address" })
          return
        }
        if (!isNumber(params.amount)) {
          reject({ error: "Amount error" })
          return
        }
        signRequests.push({ params, site })
        async function onMessage(message, sender, sendResponse) {
          const { action, payload } = message;
          if (action === DAPP_ACTION_SEND_TRANSACTION) {
            extension.runtime.onMessage.removeListener(onMessage)
            that.setBadgeContent("request_sign", BADGE_MINUS)
            await closePopupWindow(windowId.request_sign)
            if (payload.ledgerWallet) {
              resolve({
                isConfirmed: payload.isConfirmed,
                ...payload
              })
            } else {
              resolve({
                isConfirmed: payload.isConfirmed
              })
            }
            sendResponse()
          }
        }
        extension.runtime.onMessage.addListener(onMessage)
        let isUnlocked = this.getAppLockStatus()
        isUnlocked = isUnlocked ? 1 : 0
        let siteUrl = site
        let icon = await this.getWebIcon(site)

        let context = params.context
        let message = params.message
        let address = params.address

        await this.dappOpenPopWindow('./popup.html#/request_sign?isUnlocked=' + encodeURIComponent(isUnlocked)
          + "&siteUrl=" + encodeURIComponent(siteUrl)
          + "&context=" + encodeURIComponent(context) + "&message=" + encodeURIComponent(message) + "&address=" + encodeURIComponent(address)
          + "&siteIcon=" + encodeURIComponent(icon),
          windowId.request_sign, "dapp")
        this.setBadgeContent("request_sign", BADGE_ADD)
      } catch (error) {
        reject(error)
      }
    })
  }
  getSignParams() {
    if (signRequests.length > 0) {
      return signRequests[signRequests.length - 1];
    }
    return null
  }
  getAllApproveAccount(siteUrl) {
    let isUnlocked = this.getAppLockStatus()
    if (isUnlocked) {
      let approveList = this.getDappStore().approveList
      let accountList = approveList[siteUrl] || []
      return accountList
    }
    return []
  }
  getConncetStatus(siteUrl, address) {
    let approveList = this.getDappStore().approveList
    let accountList = approveList[siteUrl] || []
    let accountIndex = this.getAccountIndex(accountList, address)
    if (accountIndex !== -1) {
      return true
    }
    return false
  }
  async getApproveAccountSinger(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let signer = await apiService.getCurrentSinger(req.address)
        let context = req.context
        let message = hex2uint(req.message)
        const signature = await signer.sign(context, message);
        let signatureHex = uint2hex(signature)
        resolve({ signatureHex })
      } catch (error) {
        reject(error)
      }
    })

  }
  async dappOpenPopWindow(url,
    channel = "default",
    windowType = "",
    options = {}) {
    let that = this
    let popupWindowId = await openPopupWindow(url, channel, windowType, options)//获取到windowId
    this.setCurrentOpenWindow(url, channel)
    let listener = extension.tabs.onRemoved.addListener(function (tabInfo, changeInfo) {
      if (popupWindowId === changeInfo.windowId) {
        extension.tabs.onRemoved.removeListener(listener)
        extension.runtime.sendMessage({
          type: FROM_BACK_TO_RECORD,
          action: DAPP_CLOSE_POPUP_WINDOW,
        });
        if (channel === windowId.request_sign) {
          signRequests = []
        }
        that.setBadgeContent(channel, BADGE_MINUS)
        that.clearCurrentOpenWindow()
      }
    });

  }
  setCurrentOpenWindow(url, channel) {
    this.dappStore.updateState({
      currentOpenWindow: {
        url, channel
      }
    })
  }
  clearCurrentOpenWindow() {
    this.dappStore.updateState({
      currentOpenWindow: {}
    })
  }
  getCurrentOpenWindow() {
    return this.getDappStore().currentOpenWindow
  }
  setBadgeContent(content, type) {
    let contentIndex = badgeList.indexOf(content)
    if (type === BADGE_ADD) {
      if (contentIndex === -1) {
        badgeList.push(content)
      }
    } else {
      if (contentIndex !== -1) {
        badgeList.splice(contentIndex, 1)
      }
    }
    if (badgeList.length > 0) {
      extension.browserAction.setBadgeText({ text: badgeList.length.toString() });
      extension.browserAction.setBadgeBackgroundColor({ color: [76, 148, 255, 255] });
    } else {
      extension.browserAction.setBadgeText({ text: "" });
      extension.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
    }
  }
  async getCurrentApprovePublicKey(siteUrl) {
    let isUnlocked = await this.getAppLockStatus()
    if (isUnlocked) {
      let approveList = this.getDappStore().approveList
      let accountList = approveList[siteUrl] || []
      if (accountList.length === 0) {
        return ""
      }
      accountList = accountList.filter((item) => {
        return item.isConnecting
      })
      return [accountList[0].publicKey]
    } else {
      return { error: "Please unlock the wallet first" }
    }
  }
  /**
 * get dapp account  address
 * @param {*} siteUrl
 * @returns
 */
  async getCurrentApproveAccount(siteUrl, address = "") {
    let isUnlocked = await this.getAppLockStatus()
    if (isUnlocked) {
      let approveList = this.getDappStore().approveList
      let accountList = approveList[siteUrl] || []
      if (accountList.length === 0) {
        return ""
      }

      if (address) {
        let addressIndex = this.getAccountIndex(accountList, address)
        if (addressIndex !== -1) {
          return accountList[addressIndex]
        } else {
          return ""
        }
      } else {
        accountList = accountList.filter((item) => {
          return item.isConnecting
        })
        let res = await this.getFormatPublickey(accountList[0].publicKey)
        return res
      }
    }
    return ""
  }
  getDappStore() {
    return this.dappStore.getState()
  };
  getAppLockStatus() {
    return apiService.getLockStatus()
  }
  /**
  * get the account  exist in web approve list
  * @param {*} address
  * @param {*} accountList
  * @returns
  */
  getAccountIndex(accountList, address) {
    let keysList = accountList.map((item, index) => {
      return item.address
    })
    return keysList.indexOf(address)
  }
  /**
* set target account to connect
* @param {*} list
* @param {*} address
*/
  setTargetConnect(list, address) {
    let newList = []
    let connectStatus = false
    let currentAccount = {}
    if (list.length > 0 && !!address) {
      for (let index = 0; index < list.length; index++) {
        let account = list[index];
        if (account.address === address) {
          account.isConnecting = true
          currentAccount = account
          connectStatus = true
        } else {
          account.isConnecting = false
        }
        newList.push(connectAccountDataFilter(account))
      }
    }
    return { newList, connectStatus, currentAccount }
  }
  /**
 * get current web url and disconnect
 * @param {*} siteUrl
 * @param {*} address
 * @returns
 */
  disconnectDapp(siteUrl, address, currentAddress) {
    let approveList = this.getDappStore().approveList
    let accountList = approveList[siteUrl] || []
    let accountIndex = this.getAccountIndex(accountList, address)
    if (accountIndex === -1) {
      return accountList
    }
    let activePublicKey = ""
    let newList = accountList.filter((item) => {
      return item.address !== address
    })
    if (newList.length > 0) {
      let connectingList = newList.filter((item, index) => {
        return item.isConnecting
      })
      if (connectingList.length > 0) {
        approveList[siteUrl] = newList
      } else {
        let result = this.setTargetConnect(newList, currentAddress)
        if (result.connectStatus) {
          activePublicKey = result.currentAccount.publicKey
          approveList[siteUrl] = result.newList
        } else {
          newList[0].isConnecting = true
          activePublicKey = newList[0].publicKey
          approveList[siteUrl] = newList
        }
      }
    } else {
      approveList[siteUrl] = newList
    }
    this.dappStore.updateState({
      approveList: approveList
    })
    this.notifyAccountChange(activePublicKey, "disconnectDapp")
    return newList
  }
  setDAppCurrentConnect(siteUrl, account) {
    let approveList = this.getDappStore().approveList
    let accountList = approveList[siteUrl] || []
    let connectIndex = this.getAccountIndex(accountList, account.address)
    let newAccountList = []
    let activePublicKey = ""
    activePublicKey = account.publicKey
    for (let index = 0; index < accountList.length; index++) {
      let account = accountList[index];
      if (connectIndex !== -1 && connectIndex === index) {
        account.isConnecting = true
        newAccountList.push(account)
      } else {
        account.isConnecting = false
        newAccountList.push(account)
      }
    }
    if (connectIndex === -1) {
      account.isConnected = true
      account.isConnecting = true
      let newData = connectAccountDataFilter(account)
      newAccountList.push(newData)
    }

    approveList[siteUrl] = newAccountList
    this.dappStore.updateState({
      approveList: approveList
    })
    this.notifyAccountChange(activePublicKey, "setDAppCurrentConnect")
    return accountList
  }
  /**
   * delete all connect of target address . when delete account
   * @param {*} address
   */
  deleteDAppConnect(address, currentAddress) {
    let approveList = this.getDappStore().approveList
    let keysList = Object.keys(approveList)
    let activePublicKey = ""
    if (keysList.length > 0) {
      let newApproveList = {}
      for (let index = 0; index < keysList.length; index++) {
        const siteUrl = keysList[index];
        let accountList = approveList[siteUrl]
        let accountIndex = this.getAccountIndex(accountList, address)
        if (accountIndex !== -1) {
          let isConnecting = accountList[accountIndex]
          accountList.splice(accountIndex, 1)
          if (isConnecting && accountList.length > 0) {
            let result = this.setTargetConnect(accountList, currentAddress)
            if (result.connectStatus) {
              accountList = result.newList
              activePublicKey = result.currentAccount.publicKey
            } else {
              accountList = result.newList
              accountList[0].isConnecting = true
              activePublicKey = accountList[0].publicKey
            }
          }
        }
        newApproveList[siteUrl] = accountList
      }
      this.dappStore.updateState({
        approveList: newApproveList
      })
      this.notifyAccountChange(activePublicKey, "deleteDAppConnect")
      return newApproveList
    }
    return null
  }
  /**
 * change current connecting
 * @param {*} address
 */
  changeCurrentConnecting(address) {
    let approveList = this.getDappStore().approveList
    let keysList = Object.keys(approveList)
    let activePublicKey = ""
    for (let index = 0; index < keysList.length; index++) {
      const siteUrl = keysList[index];
      let accountList = approveList[siteUrl]
      let accountIndex = this.getAccountIndex(accountList, address)
      if (accountIndex !== -1) {
        if (!accountList[accountIndex].isConnecting) {
          accountList = accountList.map((item, index) => {
            item.isConnecting = false
            return item
          })
          accountList[accountIndex].isConnecting = true
          activePublicKey = accountList[accountIndex].publicKey
        }
        approveList[siteUrl] = accountList
      }
    }
    this.dappStore.updateState({
      approveList: approveList
    })
    this.notifyAccountChange(activePublicKey, "changeCurrentConnecting")
  }
  async notifyAccountChange(publicKey) {
    sendMsg({
      action: BACKGROUND_KEYS_CHANGED,
      payload: { publicKey }
    })
  }
}

const extDappService = new ExtDappService()
export default extDappService
